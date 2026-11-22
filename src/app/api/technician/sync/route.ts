import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { logAuditActivity } from '@/lib/auth';
import { toDbDate, addCalendarMonths, toDateInputString } from '@/lib/dates';
import { validateTaskCompletionAction } from '@/lib/i18n/taskAction';
import {
  EVIDENCE_NO_STORE_HEADERS,
  parsePhotosField,
  sanitizeIdSegment,
  uploadLegacyDataUrlToEvidenceBucket,
  validateStoredPhotoUrl,
} from '@/lib/evidencePhotos';

export const dynamic = 'force-dynamic';

interface NormalizedPhotoInput {
  clientPhotoId: string;
  photoUrl: string;
  category: string;
  caption: string | null;
  capturedAt: Date;
  dayOfWeek: string;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  gpsSource: string;
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseAuthoritativeDate(raw: unknown, fallback: Date): Date {
  if (!raw) return fallback;
  const asNum = typeof raw === 'number' ? raw : Number(raw);
  const dt = Number.isFinite(asNum) && asNum > 1e11 ? new Date(asNum) : new Date(String(raw));
  return isNaN(dt.getTime()) ? fallback : dt;
}

/**
 * Resolves and validates incoming photo entries:
 * - Already uploaded https:// URLs -> strictly validated via validateStoredPhotoUrl (rejects blob:/data:/http:/cross-org)
 * - Legacy offline recovery `data:image/...` -> uploaded FIRST to private `evidence-photos` bucket (throws on error, NEVER swallowed!)
 * - Any blob: or invalid URL -> throws explicit error so item fails loudly instead of silently losing evidence.
 */
async function resolveConfirmedPhotoUrl(params: {
  rawUrl: string;
  organizationId: string;
  folder: 'inspections' | 'tasks' | 'reports';
  clientPhotoId: string;
}): Promise<string> {
  const trimmed = String(params.rawUrl || '').trim();
  if (!trimmed) {
    throw new Error('Empty photo URL');
  }

  if (trimmed.toLowerCase().startsWith('blob:')) {
    throw new Error('Local blob: URLs cannot be synced. Photo must be uploaded first.');
  }

  // Legacy offline recovery path: upload base64 to private bucket FIRST; throw on failure (never swallow!)
  if (trimmed.toLowerCase().startsWith('data:image/')) {
    const uploaded = await uploadLegacyDataUrlToEvidenceBucket({
      dataUrl: trimmed,
      organizationId: params.organizationId,
      folder: params.folder,
      clientPhotoId: params.clientPhotoId,
    });
    return uploaded.storageUrl;
  }

  const check = validateStoredPhotoUrl(trimmed, params.organizationId);
  if (!check.valid) {
    throw new Error(check.error);
  }
  return check.url;
}

export async function POST(request: Request) {
  try {
    // 1. Session Verification
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Authentication required' },
        { status: 401, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }
    const userId = auth.user.id;
    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'No associated organization found' },
        { status: 403, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    // 2. Size Guard: reject oversize request bodies (>2.5MB)
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2.5 * 1024 * 1024) {
      return NextResponse.json(
        {
          status: 'FAILED',
          error: 'Payload too large (>2.5MB limit). Please upload photos via /api/photos/upload first.',
        },
        { status: 413, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload' },
        { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
      );
    }

    // Accept either an array of items or a single item
    const items: any[] = Array.isArray(body?.items)
      ? body.items
      : body?.clientSyncId
      ? [body]
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No sync items provided' },
        { status: 400, headers: EVIDENCE_NO_STORE_HEADERS }
      );
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
          let existingEntityId: string | null = null;
          try {
            const parsedPrev = JSON.parse(existingQueueItem.payload || '{}');
            existingEntityId = parsedPrev?.createdEntityId || null;
          } catch {}
          results.push({
            clientSyncId,
            status: 'SYNCED',
            deduplicated: true,
            entityId: existingEntityId,
            message: 'Already synced (idempotent duplicate skipped)',
            syncedAt: existingQueueItem.syncedAt,
          });
          continue;
        }

        // B. Upsert SyncQueue ledger entry as PENDING
        // Strip raw base64 blobs from SyncQueue storage after parsing so DB stays lean
        const data = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload || {};
        const ledgerPayloadForInit = { ...data };
        if (typeof ledgerPayloadForInit.photoDataUrl === 'string' && ledgerPayloadForInit.photoDataUrl.startsWith('data:')) {
          ledgerPayloadForInit.photoDataUrl = '[uploading]';
        }

        const ledger = await (db as any).syncQueue.upsert({
          where: { clientSyncId },
          update: {
            actionType,
            payload: JSON.stringify(ledgerPayloadForInit),
            status: 'PENDING',
          },
          create: {
            technicianId: userId,
            clientSyncId,
            actionType,
            payload: JSON.stringify(ledgerPayloadForInit),
            status: 'PENDING',
            createdAt: createdAt ? new Date(createdAt) : new Date(),
          },
        });
        ledgerId = ledger.id;

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
            photoRecords,
            latitude,
            longitude,
            gpsAccuracy,
            gpsSource,
            capturedAt,
            dayOfWeek,
            technicianName,
          } = data;

          // FK Safety: Verify or resolve Building (scoped to organizationId!)
          let validBuildingId = buildingId;
          if (validBuildingId) {
            const bldgExists = await (db as any).building.findFirst({
              where: { id: validBuildingId, organizationId },
              select: { id: true },
            });
            if (!bldgExists) {
              validBuildingId = null;
            }
          }
          if (!validBuildingId) {
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
          let eqLookupId = equipmentId;
          if (eqLookupId && typeof eqLookupId === 'string' && eqLookupId.startsWith('AMC-')) {
            eqLookupId = eqLookupId.substring(4);
          }
          if (eqLookupId) {
            const eqExists = await (db as any).equipment.findFirst({
              where: { id: eqLookupId, organizationId },
              select: { id: true, qrCode: true, serviceIntervalMonths: true },
            });
            if (eqExists) {
              validEquipmentId = eqExists.id;
            }
          }

          const fallbackDate = createdAt ? new Date(createdAt) : new Date();
          const authoritativeDate = parseAuthoritativeDate(capturedAt, fallbackDate);
          const derivedDay = dayOfWeek || DAY_NAMES[authoritativeDate.getDay()];

          // Collect & confirm ALL photos BEFORE saving the inspection record (ZERO swallowed failures!)
          const confirmedPhotos: NormalizedPhotoInput[] = [];
          const seenClientPhotoIds = new Set<string>();
          const seenUrls = new Set<string>();

          if (Array.isArray(photoRecords) && photoRecords.length > 0) {
            for (let idx = 0; idx < photoRecords.length; idx++) {
              const pr = photoRecords[idx];
              const rawU = pr?.photoUrl || pr?.storageUrl || pr?.photoDataUrl;
              if (!rawU || typeof rawU !== 'string') continue;
              const cpid = sanitizeIdSegment(
                pr?.clientPhotoId || pr?.client_id || `${clientSyncId}-p${idx}`,
                `${clientSyncId}-p${idx}`
              );
              if (seenClientPhotoIds.has(cpid)) continue;
              const confirmedUrl = await resolveConfirmedPhotoUrl({
                rawUrl: rawU,
                organizationId,
                folder: 'inspections',
                clientPhotoId: cpid,
              });
              const pDate = parseAuthoritativeDate(pr?.capturedAt, authoritativeDate);
              seenClientPhotoIds.add(cpid);
              seenUrls.add(confirmedUrl);
              confirmedPhotos.push({
                clientPhotoId: cpid,
                photoUrl: confirmedUrl,
                category: pr?.category || data.photoCategory || 'GAUGE',
                caption: pr?.caption || data.caption || remarks || null,
                capturedAt: pDate,
                dayOfWeek: pr?.dayOfWeek || DAY_NAMES[pDate.getDay()],
                latitude: pr?.latitude !== undefined && pr?.latitude !== null ? Number(pr.latitude) : latitude != null ? Number(latitude) : null,
                longitude: pr?.longitude !== undefined && pr?.longitude !== null ? Number(pr.longitude) : longitude != null ? Number(longitude) : null,
                gpsAccuracy: pr?.gpsAccuracy !== undefined && pr?.gpsAccuracy !== null ? Number(pr.gpsAccuracy) : gpsAccuracy != null ? Number(gpsAccuracy) : null,
                gpsSource: pr?.gpsSource || gpsSource || (data.isBasementCached ? 'BASEMENT_CACHED' : 'LIVE'),
              });
            }
          }

          // Also process legacy photoUrl / photos / photoDataUrl fields (if photoRecords was not provided)
          if (confirmedPhotos.length === 0) {
            const rawList: string[] = [];
            if (Array.isArray(photos)) {
              for (const p of photos) {
                if (typeof p === 'string' && p.trim() && !rawList.includes(p.trim())) rawList.push(p.trim());
              }
            }
            if (typeof photoUrl === 'string' && photoUrl.trim() && !rawList.includes(photoUrl.trim())) {
              rawList.push(photoUrl.trim());
            }
            if (typeof photoDataUrl === 'string' && photoDataUrl.trim() && !rawList.includes(photoDataUrl.trim())) {
              rawList.push(photoDataUrl.trim());
            }

            for (let idx = 0; idx < rawList.length; idx++) {
              const cpid = sanitizeIdSegment(
                data.clientPhotoId || `${clientSyncId}-p${idx}`,
                `${clientSyncId}-p${idx}`
              );
              const confirmedUrl = await resolveConfirmedPhotoUrl({
                rawUrl: rawList[idx],
                organizationId,
                folder: 'inspections',
                clientPhotoId: cpid,
              });
              if (seenUrls.has(confirmedUrl)) continue;
              seenClientPhotoIds.add(cpid);
              seenUrls.add(confirmedUrl);
              confirmedPhotos.push({
                clientPhotoId: cpid,
                photoUrl: confirmedUrl,
                category: data.photoCategory || 'GAUGE',
                caption: data.caption || remarks || null,
                capturedAt: authoritativeDate,
                dayOfWeek: derivedDay,
                latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
                longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
                gpsAccuracy: gpsAccuracy !== undefined && gpsAccuracy !== null ? Number(gpsAccuracy) : null,
                gpsSource: gpsSource || (data.isBasementCached ? 'BASEMENT_CACHED' : 'LIVE'),
              });
            }
          }

          const uploadedPhotoUrls = confirmedPhotos.map((p) => p.photoUrl);
          const primaryPhoto = uploadedPhotoUrls[0] || null;

          const safeStatus = ['PASSED', 'FAILED', 'SERVICE_REQUIRED', 'REPLACEMENT_REQUIRED'].includes(status)
            ? status
            : 'PASSED';

          // Create Inspection with confirmed https:// photo URLs
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
          data.createdEntityId = inspection.id;
          data.photoUrl = primaryPhoto;
          data.photoDataUrl = undefined;
          data.photos = uploadedPhotoUrls;

          // Upsert InspectionPhoto records idempotently by clientPhotoId (ZERO duplicates, ZERO swallowed errors!)
          for (const cp of confirmedPhotos) {
            await (db as any).inspectionPhoto.upsert({
              where: { clientPhotoId: cp.clientPhotoId },
              update: {
                inspectionId: inspection.id,
                equipmentId: validEquipmentId,
                photoUrl: cp.photoUrl,
                caption: cp.caption,
                // Retain original capturedAt (never overwrite with now!)
              },
              create: {
                inspectionId: inspection.id,
                equipmentId: validEquipmentId,
                clientPhotoId: cp.clientPhotoId,
                category: cp.category,
                photoUrl: cp.photoUrl,
                caption: cp.caption,
                capturedAt: cp.capturedAt,
                dayOfWeek: cp.dayOfWeek,
                latitude: cp.latitude,
                longitude: cp.longitude,
                gpsAccuracy: cp.gpsAccuracy,
                gpsSource: cp.gpsSource,
              },
            });
          }

          // Update Equipment & ServiceLog
          if (validEquipmentId) {
            const eq = await (db as any).equipment.findUnique({
              where: { id: validEquipmentId },
              select: { id: true, qrCode: true, serviceIntervalMonths: true },
            });

            if (eq) {
              const months = Number(eq.serviceIntervalMonths) || 12;
              const nextDueStr = addCalendarMonths(toDateInputString(authoritativeDate), months);
              const nextDueDate = toDbDate(nextDueStr);
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

          // If linked to a work order, complete it and persist its photo too
          if (workOrderId) {
            await (db as any).workOrder
              .update({
                where: { id: workOrderId },
                data: {
                  status: 'COMPLETED',
                  completedAt: authoritativeDate,
                  ...(primaryPhoto ? { photoUrl: primaryPhoto } : {}),
                },
              })
              .catch(() => {});
          }

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
              photoCount: uploadedPhotoUrls.length,
              syncedFromField: true,
              capturedAt: authoritativeDate.toISOString(),
            }),
          }).catch(() => {});
        } else if (actionType === 'UPDATE_STATUS' || actionType === 'COMPLETE_WORK_ORDER') {
          const {
            workOrderId,
            status: woStatus,
            notes,
            completedAt,
            photoDataUrl,
            photoUrl,
            photoRecords,
            latitude,
            longitude,
            gpsAccuracy,
            gpsSource,
            capturedAt,
            dayOfWeek,
          } = data;
          const rawActionTaken = data.actionTaken ?? data.action_taken;
          if (!workOrderId) {
            throw new Error('workOrderId is required for work order status update');
          }

          if (typeof workOrderId === 'string' && workOrderId.startsWith('AMC-')) {
            createdEntityId = workOrderId;
          } else {
            const existingWo = await (db as any).workOrder.findFirst({
              where: { id: workOrderId, organizationId },
              select: {
                id: true,
                title: true,
                buildingId: true,
                equipmentId: true,
                notes: true,
                photoUrl: true,
                building: { select: { name: true } },
              },
            });

            if (!existingWo) {
              throw new Error(`Work order '${workOrderId}' not found in database`);
            }

            const isCompleting = woStatus === 'COMPLETED' || actionType === 'COMPLETE_WORK_ORDER';
            const updateData: any = {};
            if (woStatus) {
              const validWoStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
              if (validWoStatuses.includes(woStatus)) {
                updateData.status = woStatus;
              }
            }
            if (isCompleting) {
              const validation = validateTaskCompletionAction(
                rawActionTaken,
                notes !== undefined ? notes : existingWo.notes
              );
              if (!validation.ok) {
                throw new Error(validation.error);
              }
              updateData.status = 'COMPLETED';
              updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
              updateData.actionTaken = validation.actionTaken;
              if (notes !== undefined) {
                updateData.notes = validation.notes;
              }
            } else {
              if (rawActionTaken !== undefined) {
                const validation = validateTaskCompletionAction(rawActionTaken, notes ?? existingWo.notes);
                if (!validation.ok) {
                  throw new Error(validation.error);
                }
                updateData.actionTaken = validation.actionTaken;
              }
              if (notes !== undefined) {
                const trimmed = typeof notes === 'string' ? notes.trim() : '';
                updateData.notes = trimmed.length > 0 ? trimmed : null;
              }
            }

            const fallbackDate = completedAt
              ? new Date(completedAt)
              : createdAt
              ? new Date(createdAt)
              : new Date();
            const authoritativeDate = parseAuthoritativeDate(capturedAt, fallbackDate);
            const derivedDay = dayOfWeek || DAY_NAMES[authoritativeDate.getDay()];

            // Resolve & confirm ALL work-order photos FIRST (ZERO swallowed errors!)
            const confirmedPhotos: NormalizedPhotoInput[] = [];
            const seenIds = new Set<string>();

            if (Array.isArray(photoRecords) && photoRecords.length > 0) {
              for (let idx = 0; idx < photoRecords.length; idx++) {
                const pr = photoRecords[idx];
                const rawU = pr?.photoUrl || pr?.storageUrl || pr?.photoDataUrl;
                if (!rawU || typeof rawU !== 'string') continue;
                const cpid = sanitizeIdSegment(
                  pr?.clientPhotoId || pr?.client_id || `${clientSyncId}-wo-p${idx}`,
                  `${clientSyncId}-wo-p${idx}`
                );
                if (seenIds.has(cpid)) continue;
                const confirmedUrl = await resolveConfirmedPhotoUrl({
                  rawUrl: rawU,
                  organizationId,
                  folder: 'tasks',
                  clientPhotoId: cpid,
                });
                const pDate = parseAuthoritativeDate(pr?.capturedAt, authoritativeDate);
                seenIds.add(cpid);
                confirmedPhotos.push({
                  clientPhotoId: cpid,
                  photoUrl: confirmedUrl,
                  category: 'TASK_COMPLETION',
                  caption: pr?.caption || updateData.notes || existingWo.title || null,
                  capturedAt: pDate,
                  dayOfWeek: pr?.dayOfWeek || DAY_NAMES[pDate.getDay()],
                  latitude: pr?.latitude != null ? Number(pr.latitude) : latitude != null ? Number(latitude) : null,
                  longitude: pr?.longitude != null ? Number(pr.longitude) : longitude != null ? Number(longitude) : null,
                  gpsAccuracy: pr?.gpsAccuracy != null ? Number(pr.gpsAccuracy) : gpsAccuracy != null ? Number(gpsAccuracy) : null,
                  gpsSource: pr?.gpsSource || gpsSource || 'LIVE',
                });
              }
            } else {
              const rawTaskPhoto = photoUrl || photoDataUrl;
              if (typeof rawTaskPhoto === 'string' && rawTaskPhoto.trim()) {
                const cpid = sanitizeIdSegment(
                  data.clientPhotoId || `${clientSyncId}-wo-p0`,
                  `${clientSyncId}-wo-p0`
                );
                const confirmedUrl = await resolveConfirmedPhotoUrl({
                  rawUrl: rawTaskPhoto,
                  organizationId,
                  folder: 'tasks',
                  clientPhotoId: cpid,
                });
                confirmedPhotos.push({
                  clientPhotoId: cpid,
                  photoUrl: confirmedUrl,
                  category: 'TASK_COMPLETION',
                  caption: updateData.notes || existingWo.title || null,
                  capturedAt: authoritativeDate,
                  dayOfWeek: derivedDay,
                  latitude: latitude != null ? Number(latitude) : null,
                  longitude: longitude != null ? Number(longitude) : null,
                  gpsAccuracy: gpsAccuracy != null ? Number(gpsAccuracy) : null,
                  gpsSource: gpsSource || 'LIVE',
                });
              }
            }

            const primaryPhotoUrl = confirmedPhotos[0]?.photoUrl || null;
            if (primaryPhotoUrl) {
              updateData.photoUrl = primaryPhotoUrl;
            }

            const updated = await (db as any).workOrder.update({
              where: { id: existingWo.id },
              data: updateData,
            });
            createdEntityId = updated.id;
            data.createdEntityId = updated.id;
            data.photoUrl = primaryPhotoUrl || existingWo.photoUrl || null;
            data.photoDataUrl = undefined;

            // Persist WorkOrderPhoto rows idempotently by clientPhotoId (ZERO duplicates!)
            for (const cp of confirmedPhotos) {
              await (db as any).workOrderPhoto.upsert({
                where: { clientPhotoId: cp.clientPhotoId },
                update: {
                  workOrderId: updated.id,
                  photoUrl: cp.photoUrl,
                  caption: cp.caption,
                },
                create: {
                  workOrderId: updated.id,
                  organizationId,
                  clientPhotoId: cp.clientPhotoId,
                  photoUrl: cp.photoUrl,
                  caption: cp.caption,
                  capturedAt: cp.capturedAt,
                  dayOfWeek: cp.dayOfWeek,
                  latitude: cp.latitude,
                  longitude: cp.longitude,
                  gpsAccuracy: cp.gpsAccuracy,
                  gpsSource: cp.gpsSource,
                },
              });
            }

            // Update Equipment.photoUrl if linked
            if (primaryPhotoUrl && existingWo.equipmentId) {
              await (db as any).equipment
                .update({
                  where: { id: existingWo.equipmentId },
                  data: { photoUrl: primaryPhotoUrl },
                })
                .catch(() => {});
            }

            if (isCompleting) {
              await logAuditActivity({
                organizationId,
                userId,
                userEmail: auth.user.email,
                action: 'WORK_ORDER_COMPLETED',
                entityType: 'WorkOrder',
                entityId: updated.id,
                details: JSON.stringify({
                  workOrderId: updated.id,
                  title: existingWo.title,
                  buildingId: existingWo.buildingId,
                  buildingName: existingWo.building?.name || null,
                  equipmentId: existingWo.equipmentId || null,
                  status: 'COMPLETED',
                  actionTaken: updated.actionTaken || 'NO_ACTION',
                  notes: updated.notes || null,
                  photoUrl: primaryPhotoUrl,
                  photoCount: confirmedPhotos.length,
                  syncedFromField: true,
                  clientSyncId,
                }),
              }).catch(() => {});
            }
          }
        } else if (actionType === 'UPLOAD_PHOTO') {
          const {
            photoUrl,
            photoDataUrl,
            category = 'GAUGE',
            caption,
            inspectionId,
            workOrderId,
            parentClientSyncId,
            equipmentId,
            latitude,
            longitude,
            gpsAccuracy,
            gpsSource,
            capturedAt,
            dayOfWeek,
            clientPhotoId: rawClientPhotoId,
          } = data;

          const raw = photoUrl || photoDataUrl;
          if (!raw || typeof raw !== 'string') {
            throw new Error('photoUrl or photoDataUrl is required for UPLOAD_PHOTO');
          }

          const clientPhotoId = sanitizeIdSegment(rawClientPhotoId || clientSyncId, clientSyncId);
          const folder: 'tasks' | 'inspections' = workOrderId ? 'tasks' : 'inspections';
          const finalPhotoUrl = await resolveConfirmedPhotoUrl({
            rawUrl: raw,
            organizationId,
            folder,
            clientPhotoId,
          });

          const authoritativeDate = parseAuthoritativeDate(
            capturedAt,
            createdAt ? new Date(createdAt) : new Date()
          );
          const derivedDay = dayOfWeek || DAY_NAMES[authoritativeDate.getDay()];

          if (workOrderId) {
            const woExists = await (db as any).workOrder.findFirst({
              where: { id: workOrderId, organizationId },
              select: { id: true, equipmentId: true },
            });
            if (!woExists) {
              throw new Error(`Work order '${workOrderId}' not found for photo attachment`);
            }

            await (db as any).workOrderPhoto.upsert({
              where: { clientPhotoId },
              update: {
                workOrderId: woExists.id,
                photoUrl: finalPhotoUrl,
                caption: caption || null,
              },
              create: {
                workOrderId: woExists.id,
                organizationId,
                clientPhotoId,
                photoUrl: finalPhotoUrl,
                caption: caption || null,
                capturedAt: authoritativeDate,
                dayOfWeek: derivedDay,
                latitude: latitude != null ? Number(latitude) : null,
                longitude: longitude != null ? Number(longitude) : null,
                gpsAccuracy: gpsAccuracy != null ? Number(gpsAccuracy) : null,
                gpsSource: gpsSource || 'LIVE',
              },
            });

            await (db as any).workOrder.update({
              where: { id: woExists.id },
              data: { photoUrl: finalPhotoUrl },
            });

            if (woExists.equipmentId) {
              await (db as any).equipment
                .update({ where: { id: woExists.equipmentId }, data: { photoUrl: finalPhotoUrl } })
                .catch(() => {});
            }
          } else {
            let resolvedInspectionId = inspectionId;
            let resolvedEquipmentId = equipmentId;

            if (!resolvedInspectionId && parentClientSyncId) {
              const parentQueue = await (db as any).syncQueue.findUnique({
                where: { clientSyncId: parentClientSyncId },
              });
              if (parentQueue?.payload) {
                try {
                  const parentData = JSON.parse(parentQueue.payload);
                  if (parentData.createdEntityId) {
                    resolvedInspectionId = parentData.createdEntityId;
                  }
                  if (!resolvedEquipmentId && parentData.equipmentId) {
                    resolvedEquipmentId = parentData.equipmentId;
                  }
                } catch {}
              }
            }

            if (!resolvedInspectionId) {
              const latestInsp = await (db as any).inspection.findFirst({
                where: { organizationId, technicianId: userId },
                orderBy: { date: 'desc' },
                select: { id: true, equipmentId: true },
              });
              if (latestInsp) {
                resolvedInspectionId = latestInsp.id;
                if (!resolvedEquipmentId) resolvedEquipmentId = latestInsp.equipmentId;
              }
            }

            if (!resolvedInspectionId) {
              throw new Error('Parent inspection not yet synced; retry UPLOAD_PHOTO after inspection syncs');
            }

            await (db as any).inspectionPhoto.upsert({
              where: { clientPhotoId },
              update: {
                inspectionId: resolvedInspectionId,
                equipmentId: resolvedEquipmentId || null,
                photoUrl: finalPhotoUrl,
                caption: caption || null,
              },
              create: {
                inspectionId: resolvedInspectionId,
                equipmentId: resolvedEquipmentId || null,
                clientPhotoId,
                category,
                photoUrl: finalPhotoUrl,
                caption: caption || null,
                capturedAt: authoritativeDate,
                dayOfWeek: derivedDay,
                latitude: latitude != null ? Number(latitude) : null,
                longitude: longitude != null ? Number(longitude) : null,
                gpsAccuracy: gpsAccuracy != null ? Number(gpsAccuracy) : null,
                gpsSource: gpsSource || 'LIVE',
              },
            });

            // Sync parent Inspection.photos column so EVERY dashboard view reads the full confirmed URL!
            const parentInsp = await (db as any).inspection.findUnique({
              where: { id: resolvedInspectionId },
              select: { id: true, photos: true },
            });
            if (parentInsp) {
              const existingList = parsePhotosField(parentInsp.photos);
              if (!existingList.includes(finalPhotoUrl)) {
                existingList.unshift(finalPhotoUrl);
              }
              await (db as any).inspection.update({
                where: { id: resolvedInspectionId },
                data: { photos: JSON.stringify(existingList) },
              });
            }

            if (resolvedEquipmentId) {
              await (db as any).equipment
                .update({
                  where: { id: resolvedEquipmentId },
                  data: { photoUrl: finalPhotoUrl },
                })
                .catch(() => {});
            }
          }

          data.photoUrl = finalPhotoUrl;
          data.photoDataUrl = undefined;
          createdEntityId = finalPhotoUrl;
        } else if (actionType === 'VISIT_STAMP') {
          const {
            buildingId,
            taskId,
            latitude,
            longitude,
            gpsAccuracy,
            arrivedAt,
            deviceId,
          } = data;

          let buildingName = 'Building Premises';
          if (buildingId) {
            const bldg = await (db as any).building.findUnique({
              where: { id: buildingId },
              select: { name: true },
            });
            if (bldg) buildingName = bldg.name;
          }

          const authoritativeDate = arrivedAt ? new Date(arrivedAt) : new Date();

          await (db as any).activityLog
            .create({
              data: {
                organizationId,
                userId,
                userEmail: auth.user.email,
                action: 'VISIT_STAMP',
                entityType: 'Building',
                entityId: buildingId || null,
                details: JSON.stringify({
                  buildingName,
                  taskId: taskId || null,
                  latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
                  longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
                  accuracy:
                    gpsAccuracy !== undefined && gpsAccuracy !== null ? Math.round(Number(gpsAccuracy)) : 8,
                  arrivedAt: authoritativeDate.toISOString(),
                  deviceId: deviceId || 'MOBILE_PWA',
                }),
                createdAt: authoritativeDate,
              },
            })
            .catch((err: any) => console.warn('Failed to insert activityLog for VISIT_STAMP:', err));

          createdEntityId = buildingId || 'VISIT_RECORDED';
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
              payload: JSON.stringify(data),
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

    return NextResponse.json(
      {
        success: true,
        results,
      },
      { status: 200, headers: EVIDENCE_NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('Fatal technician sync batch endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync endpoint error' },
      { status: 500, headers: EVIDENCE_NO_STORE_HEADERS }
    );
  }
}
