import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { ensureR2PhotoUrl } from '@/lib/r2';
import { logAuditActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }
    const userId = auth.user.id;
    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'No associated organization found' }, { status: 403 });
    }

    const body = await request.json();
    // Accept either an array of items or a single item
    const items: any[] = Array.isArray(body.items)
      ? body.items
      : body.clientSyncId
      ? [body]
      : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No sync items provided' }, { status: 400 });
    }

    const results: any[] = [];

    for (const item of items) {
      const { clientSyncId, actionType, payload, createdAt } = item;
      if (!clientSyncId) {
        results.push({ status: 'FAILED', error: 'Missing clientSyncId' });
        continue;
      }

      // 1. Idempotency Check in SyncQueue
      const existingQueueItem = await (db as any).syncQueue.findUnique({
        where: { clientSyncId },
      });

      if (existingQueueItem && existingQueueItem.status === 'SYNCED') {
        // Already processed earlier; return existing success without re-creating records
        results.push({
          clientSyncId,
          status: 'SYNCED',
          message: 'Already synced (idempotent duplicate skipped)',
          syncedAt: existingQueueItem.syncedAt,
        });
        continue;
      }

      // Upsert SyncQueue ledger entry as PENDING
      const ledger = await (db as any).syncQueue.upsert({
        where: { clientSyncId },
        update: {
          actionType: actionType || 'COMPLETE_INSPECTION',
          payload: typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
          status: 'PENDING',
        },
        create: {
          technicianId: userId,
          clientSyncId,
          actionType: actionType || 'COMPLETE_INSPECTION',
          payload: typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
          status: 'PENDING',
          createdAt: createdAt ? new Date(createdAt) : new Date(),
        },
      });

      try {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        let createdEntityId: string | null = null;

        if (actionType === 'COMPLETE_INSPECTION' || !actionType) {
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

          if (!buildingId) {
            throw new Error('buildingId is required in inspection payload');
          }

          // Authoritative capture time from device
          const authoritativeDate = capturedAt
            ? new Date(capturedAt)
            : createdAt
            ? new Date(createdAt)
            : new Date();

          // Derive day of week if not supplied
          const derivedDay =
            dayOfWeek ||
            ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][authoritativeDate.getDay()];

          // Resolve photos
          const rawPhotos: string[] = [];
          if (Array.isArray(photos)) {
            rawPhotos.push(...photos);
          } else if (photoDataUrl) {
            rawPhotos.push(photoDataUrl);
          } else if (photoUrl) {
            rawPhotos.push(photoUrl);
          }

          const uploadedPhotoUrls: string[] = [];
          for (const raw of rawPhotos) {
            if (raw.startsWith('data:') || raw.startsWith('http')) {
              const u = await ensureR2PhotoUrl({
                photoUrl: raw,
                organizationId,
                folder: 'inspections',
              });
              if (u) uploadedPhotoUrls.push(u);
            }
          }

          const primaryPhoto = uploadedPhotoUrls[0] || (rawPhotos[0]?.startsWith('http') ? rawPhotos[0] : null);

          // Create Inspection
          const inspection = await (db as any).inspection.create({
            data: {
              organizationId,
              buildingId,
              equipmentId: equipmentId || null,
              technicianId: userId,
              technicianName: technicianName || auth.profile?.fullName || 'Field Technician',
              status,
              checklist: typeof checklist === 'string' ? checklist : JSON.stringify(checklist || {}),
              pressureGauge: pressureGauge || (status === 'FAILED' ? 'LOW' : 'NORMAL'),
              overallCondition: overallCondition || (status === 'FAILED' ? 'NEEDS_ATTENTION' : 'GOOD'),
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

          // Create InspectionPhoto records with all 6 geo/time attributes
          for (const u of uploadedPhotoUrls) {
            await (db as any).inspectionPhoto.create({
              data: {
                inspectionId: inspection.id,
                equipmentId: equipmentId || null,
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
            }).catch((err: any) => console.warn('Failed to insert inspectionPhoto record:', err));
          }

          // Update Equipment and create ServiceLog
          if (equipmentId) {
            const eq = await (db as any).equipment.findUnique({
              where: { id: equipmentId },
              select: { id: true, qrCode: true, serviceIntervalMonths: true },
            });

            const months = Number(eq?.serviceIntervalMonths) || 12;
            const nextDueDate = new Date(authoritativeDate.getTime() + months * 30.5 * 24 * 60 * 60 * 1000);
            const isDefect = status === 'FAILED' || status === 'SERVICE_REQUIRED' || status === 'REPLACEMENT_REQUIRED';

            await (db as any).equipment.update({
              where: { id: equipmentId },
              data: {
                lastServiceDate: authoritativeDate,
                nextDueDate: isDefect ? authoritativeDate : nextDueDate,
                status: isDefect ? 'DEFECTIVE' : 'COMPLIANT',
                ...(primaryPhoto ? { photoUrl: primaryPhoto } : {}),
              },
            });

            await (db as any).serviceLog.create({
              data: {
                equipmentId,
                technicianName: technicianName || auth.profile?.fullName || 'Field Technician',
                servicedAt: authoritativeDate,
                nextDueDate,
                actionType: months === 12 ? 'Annual Refill & IS 2190 Overhaul' : 'Periodic Maintenance Check',
                notes: remarks || `Field Inspection recorded by ${technicianName || 'Field Technician'}`,
              },
            });
          }

          // If linked to a work order, complete it
          if (workOrderId) {
            await (db as any).workOrder.update({
              where: { id: workOrderId },
              data: {
                status: 'COMPLETED',
                completedAt: authoritativeDate,
              },
            }).catch(() => {});
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
              buildingId,
              equipmentId,
              status,
              syncedFromField: true,
              capturedAt: authoritativeDate.toISOString(),
            }),
          }).catch(() => {});

        } else if (actionType === 'UPDATE_STATUS' || actionType === 'COMPLETE_WORK_ORDER') {
          const { workOrderId, status, notes, completedAt } = data;
          if (!workOrderId) throw new Error('workOrderId is required for status update');

          const updateData: any = { status };
          if (status === 'COMPLETED' || actionType === 'COMPLETE_WORK_ORDER') {
            updateData.status = 'COMPLETED';
            updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
          }
          if (notes) updateData.notes = String(notes);

          const updated = await (db as any).workOrder.update({
            where: { id: workOrderId },
            data: updateData,
          });
          createdEntityId = updated.id;
        }

        // Mark ledger as SYNCED
        const now = new Date();
        await (db as any).syncQueue.update({
          where: { id: ledger.id },
          data: {
            status: 'SYNCED',
            syncedAt: now,
            errorMessage: null,
          },
        });

        results.push({
          clientSyncId,
          status: 'SYNCED',
          entityId: createdEntityId,
          syncedAt: now.toISOString(),
        });
      } catch (applyErr: any) {
        console.error(`Sync application error for ${clientSyncId}:`, applyErr);
        await (db as any).syncQueue.update({
          where: { id: ledger.id },
          data: {
            status: 'FAILED',
            errorMessage: applyErr.message || 'Unknown processing error',
          },
        });
        results.push({
          clientSyncId,
          status: 'FAILED',
          error: applyErr.message || 'Processing failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Error handling technician sync batch:', error);
    return NextResponse.json({ error: error.message || 'Sync endpoint error' }, { status: 500 });
  }
}
