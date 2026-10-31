import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { ensureR2PhotoUrl } from '@/lib/r2';
import { logAuditActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Session Verification
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }
    const userId = auth.user.id;
    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'No associated organization found' }, { status: 403 });
    }

    // 2. Size Guard: reject oversize request bodies (>2.5MB)
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2.5 * 1024 * 1024) {
      return NextResponse.json(
        {
          status: 'FAILED',
          error: 'Payload too large (>2.5MB limit). Please sync items individually or compress photos.',
        },
        { status: 413 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (parseErr: any) {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    // Accept either an array of items or a single item
    const items: any[] = Array.isArray(body?.items)
      ? body.items
      : body?.clientSyncId
      ? [body]
      : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No sync items provided' }, { status: 400 });
    }

    const results: any[] = [];

    // 3. Process items with HARD per-item isolation
    for (const item of items) {
      const clientSyncId = item?.clientSyncId;
      if (!clientSyncId) {
        results.push({ status: 'FAILED', error: 'Missing clientSyncId' });
        continue;
      }

      const actionType = item.actionType || 'COMPLETE_INSPECTION';
      const rawPayload = item.payload;
      const createdAt = item.createdAt;

      let ledgerId: string | null = null;

      try {
        // A. Idempotency Check in SyncQueue
        const existingQueueItem = await (db as any).syncQueue.findUnique({
          where: { clientSyncId },
        });

        if (existingQueueItem && existingQueueItem.status === 'SYNCED') {
          results.push({
            clientSyncId,
            status: 'SYNCED',
            message: 'Already synced (idempotent duplicate skipped)',
            syncedAt: existingQueueItem.syncedAt,
          });
          continue;
        }

        // B. Upsert SyncQueue ledger entry as PENDING
        const serializedPayload =
          typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload || {});

        const ledger = await (db as any).syncQueue.upsert({
          where: { clientSyncId },
          update: {
            actionType,
            payload: serializedPayload,
            status: 'PENDING',
          },
          create: {
            technicianId: userId,
            clientSyncId,
            actionType,
            payload: serializedPayload,
            status: 'PENDING',
            createdAt: createdAt ? new Date(createdAt) : new Date(),
          },
        });
        ledgerId = ledger.id;

        // C. Parse & Normalize Payload
        const data = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : (rawPayload || {});
        let createdEntityId: string | null = null;

        if (actionType === 'COMPLETE_INSPECTION') {
          const {
            buildingId,
            equipmentId,
            workOrderId,
            status = 'PASSED',
            checklist,
            remarks,
            pressureGauge,
            overallCondition,
            customerName,
            customerDesignation,
            customerSignature,
            technicianSignature,
            photoDataUrl,
            photoUrl,
            photos,
            latitude,
            longitude,
            gpsAccuracy,
            gpsSource,
            capturedAt,
            dayOfWeek,
            technicianName,
          } = data;

          // FK Safety: Verify or resolve Building
          let validBuildingId = buildingId;
          if (validBuildingId) {
            const bldgExists = await (db as any).building.findUnique({
              where: { id: validBuildingId },
              select: { id: true },
            });
            if (!bldgExists) {
              validBuildingId = null;
            }
          }
          if (!validBuildingId) {
            // Fallback to first building for organization so inspection is never lost
            const fallbackBldg = await (db as any).building.findFirst({
              where: { organizationId },
              select: { id: true },
            });
            if (fallbackBldg) {
              validBuildingId = fallbackBldg.id;
            } else {
              throw new Error(`Building ID '${buildingId || 'unknown'}' not found in database`);
            }
          }

          // FK Safety: Verify Equipment
          let validEquipmentId: string | null = null;
          if (equipmentId) {
            const eqExists = await (db as any).equipment.findUnique({
              where: { id: equipmentId },
              select: { id: true, qrCode: true, serviceIntervalMonths: true },
            });
            if (eqExists) {
              validEquipmentId = eqExists.id;
            }
          }

          // Authoritative capture time from device
          const authoritativeDate = capturedAt
            ? new Date(capturedAt)
            : createdAt
            ? new Date(createdAt)
            : new Date();

          const derivedDay =
            dayOfWeek ||
            ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][authoritativeDate.getDay()];

          // Resolve photos
          const rawPhotos: string[] = [];
          if (Array.isArray(photos)) {
            for (const p of photos) {
              if (typeof p === 'string' && p.trim()) rawPhotos.push(p.trim());
            }
          }
          if (photoDataUrl && typeof photoDataUrl === 'string' && !rawPhotos.includes(photoDataUrl.trim())) {
            rawPhotos.push(photoDataUrl.trim());
          }
          if (photoUrl && typeof photoUrl === 'string' && !rawPhotos.includes(photoUrl.trim())) {
            rawPhotos.push(photoUrl.trim());
          }

          const uploadedPhotoUrls: string[] = [];
          for (const raw of rawPhotos) {
            if (raw.startsWith('data:') || raw.startsWith('http')) {
              try {
                const u = await ensureR2PhotoUrl({
                  photoUrl: raw,
                  organizationId,
                  folder: 'inspections',
                });
                if (u) uploadedPhotoUrls.push(u);
              } catch (r2Err: any) {
                console.warn(`R2 upload warning for ${clientSyncId}:`, r2Err?.message);
                if (raw.startsWith('http')) uploadedPhotoUrls.push(raw);
              }
            }
          }

          const primaryPhoto = uploadedPhotoUrls[0] || (rawPhotos[0]?.startsWith('http') ? rawPhotos[0] : null);

          // Allowed status whitelist
          const safeStatus = ['PASSED', 'FAILED', 'SERVICE_REQUIRED', 'REPLACEMENT_REQUIRED'].includes(status)
            ? status
            : 'PASSED';

          // Create Inspection
          const inspection = await (db as any).inspection.create({
            data: {
              organizationId,
              buildingId: validBuildingId,
              equipmentId: validEquipmentId,
              technicianId: userId,
              technicianName: technicianName || auth.profile?.fullName || 'Field Technician',
              status: safeStatus,
              checklist: typeof checklist === 'string' ? checklist : JSON.stringify(checklist || {}),
              pressureGauge: pressureGauge || (safeStatus === 'FAILED' ? 'LOW' : 'NORMAL'),
              overallCondition: overallCondition || (safeStatus === 'FAILED' ? 'NEEDS_ATTENTION' : 'GOOD'),
              remarks: remarks || '',
              customerName: customerName || null,
              customerDesignation: customerDesignation || null,
              customerSignature: customerSignature || null,
              technicianSignature: technicianSignature || null,
              photos: uploadedPhotoUrls.length > 0 ? JSON.stringify(uploadedPhotoUrls) : null,
              latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
              longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
              gpsAccuracy: gpsAccuracy !== undefined && gpsAccuracy !== null ? Number(gpsAccuracy) : null,
              date: authoritativeDate,
            },
          });

          createdEntityId = inspection.id;

          // Create InspectionPhoto records
          for (const u of uploadedPhotoUrls) {
            await (db as any).inspectionPhoto
              .create({
                data: {
                  inspectionId: inspection.id,
                  equipmentId: validEquipmentId,
                  category: data.photoCategory || 'GAUGE',
                  photoUrl: u,
                  caption: data.caption || remarks || null,
                  capturedAt: authoritativeDate,
                  dayOfWeek: derivedDay,
                  latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
                  longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
                  gpsAccuracy: gpsAccuracy !== undefined && gpsAccuracy !== null ? Number(gpsAccuracy) : null,
                  gpsSource: gpsSource || (data.isBasementCached ? 'BASEMENT_CACHED' : 'LIVE'),
                },
              })
              .catch((err: any) => console.warn('Failed to insert inspectionPhoto record:', err));
          }

          // Update Equipment and create ServiceLog if equipmentId exists
          if (validEquipmentId) {
            const eq = await (db as any).equipment.findUnique({
              where: { id: validEquipmentId },
              select: { id: true, qrCode: true, serviceIntervalMonths: true },
            });

            if (eq) {
              const months = Number(eq.serviceIntervalMonths) || 12;
              const nextDueDate = new Date(authoritativeDate.getTime() + months * 30.5 * 24 * 60 * 60 * 1000);
              const isDefect =
                safeStatus === 'FAILED' ||
                safeStatus === 'SERVICE_REQUIRED' ||
                safeStatus === 'REPLACEMENT_REQUIRED';

              await (db as any).equipment
                .update({
                  where: { id: validEquipmentId },
                  data: {
                    lastServiceDate: authoritativeDate,
                    nextDueDate: isDefect ? authoritativeDate : nextDueDate,
                    status: isDefect ? 'DEFECTIVE' : 'COMPLIANT',
                    ...(primaryPhoto ? { photoUrl: primaryPhoto } : {}),
                  },
                })
                .catch((err: any) => console.warn('Equipment update warning:', err));

              await (db as any).serviceLog
                .create({
                  data: {
                    equipmentId: validEquipmentId,
                    technicianName: technicianName || auth.profile?.fullName || 'Field Technician',
                    servicedAt: authoritativeDate,
                    nextDueDate,
                    actionType:
                      months === 12 ? 'Annual Refill & IS 2190 Overhaul' : 'Periodic Maintenance Check',
                    notes: remarks || `Field Inspection recorded by ${technicianName || 'Field Technician'}`,
                  },
                })
                .catch((err: any) => console.warn('ServiceLog create warning:', err));
            }
          }

          // If linked to a work order, complete it
          if (workOrderId) {
            await (db as any).workOrder
              .update({
                where: { id: workOrderId },
                data: {
                  status: 'COMPLETED',
                  completedAt: authoritativeDate,
                },
              })
              .catch(() => {});
          }

          // Audit log
          await logAuditActivity({
            organizationId,
            userId,
            userEmail: auth.user.email,
            action: 'INSPECTION_COMPLETED',
            entityType: 'Inspection',
            entityId: inspection.id,
            details: JSON.stringify({
              buildingId: validBuildingId,
              equipmentId: validEquipmentId,
              status: safeStatus,
              syncedFromField: true,
              capturedAt: authoritativeDate.toISOString(),
            }),
          }).catch(() => {});

        } else if (actionType === 'UPDATE_STATUS' || actionType === 'COMPLETE_WORK_ORDER') {
          const { workOrderId, status: woStatus, notes, completedAt } = data;
          if (!workOrderId) {
            throw new Error('workOrderId is required for work order status update');
          }

          const existingWo = await (db as any).workOrder.findUnique({
            where: { id: workOrderId },
            select: { id: true },
          });

          if (!existingWo) {
            throw new Error(`Work order '${workOrderId}' not found in database`);
          }

          const updateData: any = {};
          if (woStatus) {
            // Whitelist work order statuses
            const validWoStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
            if (validWoStatuses.includes(woStatus)) {
              updateData.status = woStatus;
            }
          }
          if (woStatus === 'COMPLETED' || actionType === 'COMPLETE_WORK_ORDER') {
            updateData.status = 'COMPLETED';
            updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
          }
          if (notes) updateData.notes = String(notes);

          const updated = await (db as any).workOrder.update({
            where: { id: workOrderId },
            data: updateData,
          });
          createdEntityId = updated.id;

        } else if (actionType === 'UPLOAD_PHOTO') {
          const {
            photoUrl,
            photoDataUrl,
            category = 'GAUGE',
            caption,
            inspectionId,
            equipmentId,
            latitude,
            longitude,
            gpsAccuracy,
            gpsSource,
            capturedAt,
            dayOfWeek,
          } = data;

          const raw = photoDataUrl || photoUrl;
          if (!raw) {
            throw new Error('photoDataUrl or photoUrl is required for UPLOAD_PHOTO');
          }

          const uploadedUrl = await ensureR2PhotoUrl({
            photoUrl: raw,
            organizationId,
            folder: 'inspections',
          });
          const finalPhotoUrl = uploadedUrl || (raw.startsWith('http') ? raw : null);
          if (!finalPhotoUrl) {
            throw new Error('Failed to upload photo to storage');
          }

          const authoritativeDate = capturedAt ? new Date(capturedAt) : new Date();
          const derivedDay =
            dayOfWeek || ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][authoritativeDate.getDay()];

          if (inspectionId) {
            await (db as any).inspectionPhoto
              .create({
                data: {
                  inspectionId,
                  equipmentId: equipmentId || null,
                  category,
                  photoUrl: finalPhotoUrl,
                  caption: caption || null,
                  capturedAt: authoritativeDate,
                  dayOfWeek: derivedDay,
                  latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
                  longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
                  gpsAccuracy: gpsAccuracy !== undefined && gpsAccuracy !== null ? Number(gpsAccuracy) : null,
                  gpsSource: gpsSource || 'LIVE',
                },
              })
              .catch((err: any) => console.warn('Failed to insert inspectionPhoto in UPLOAD_PHOTO:', err));
          }

          if (equipmentId) {
            await (db as any).equipment
              .update({
                where: { id: equipmentId },
                data: { photoUrl: finalPhotoUrl },
              })
              .catch(() => {});
          }

          createdEntityId = finalPhotoUrl;

        } else {
          throw new Error(`Unknown actionType: '${actionType}'`);
        }

        // Mark ledger as SYNCED
        const now = new Date();
        if (ledgerId) {
          await (db as any).syncQueue.update({
            where: { id: ledgerId },
            data: {
              status: 'SYNCED',
              syncedAt: now,
              errorMessage: null,
            },
          });
        }

        results.push({
          clientSyncId,
          status: 'SYNCED',
          entityId: createdEntityId,
          syncedAt: now.toISOString(),
        });
      } catch (applyErr: any) {
        console.error(
          `Sync application error for ${clientSyncId} [Code: ${applyErr?.code || 'NONE'}]:`,
          applyErr?.message || applyErr
        );

        if (ledgerId) {
          await (db as any).syncQueue
            .update({
              where: { id: ledgerId },
              data: {
                status: 'FAILED',
                errorMessage: applyErr.message || 'Unknown processing error',
              },
            })
            .catch(() => {});
        }

        results.push({
          clientSyncId,
          status: 'FAILED',
          error: applyErr.message || 'Processing failed',
        });
      }
    }

    // Always return 200 with per-item outcomes so client gets structured results
    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Fatal technician sync batch endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Sync endpoint error' }, { status: 500 });
  }
}
