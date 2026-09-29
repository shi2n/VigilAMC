import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity } from '@/lib/auth';
import { ImportType, DuplicateStrategy } from '@/lib/excelImport';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.user || auth.profile?.role === 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'No organization attached to this account' }, { status: 400 });
    }

    const body = await request.json();
    const {
      type,
      duplicateStrategy = 'SKIP',
      rows,
      filename,
      isFinalChunk = false,
      batchSummary,
    } = body as {
      type: ImportType;
      duplicateStrategy: DuplicateStrategy;
      rows: Array<{
        rowNumber: number;
        originalData: Record<string, any>;
        parsedData: Record<string, any>;
      }>;
      filename?: string;
      isFinalChunk?: boolean;
      batchSummary?: {
        totalRows: number;
        cumulativeImported: number;
        cumulativeUpdated: number;
        cumulativeSkipped: number;
        cumulativeFailed: number;
      };
    };

    if (!type || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid batch payload' }, { status: 400 });
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: Array<{
      rowNumber: number;
      originalData: Record<string, any>;
      errorReason: string;
      suggestedCorrection: string;
    }> = [];

    // Pre-cache existing clients and buildings for fast resolution
    const [existingClients, existingBuildings] = await Promise.all([
      (db as any).client.findMany({
        where: { organizationId },
        select: { id: true, name: true, email: true },
      }),
      (db as any).building.findMany({
        where: { organizationId },
        select: { id: true, name: true, clientId: true },
      }),
    ]);

    const clientMapByName = new Map<string, any>();
    existingClients.forEach((c: any) => clientMapByName.set(c.name.trim().toLowerCase(), c));

    const buildingMapByName = new Map<string, any>();
    existingBuildings.forEach((b: any) => buildingMapByName.set(b.name.trim().toLowerCase(), b));

    // Helper: get or create client
    async function getOrCreateClient(name: string, contactPerson?: string, phone?: string, email?: string) {
      const cleanName = (name || 'General Client').trim();
      const lower = cleanName.toLowerCase();
      if (clientMapByName.has(lower)) {
        return clientMapByName.get(lower);
      }
      const created = await (db as any).client.create({
        data: {
          organizationId,
          name: cleanName,
          contactPerson: contactPerson || 'Facility Manager',
          phone: phone || '',
          email: email || null,
        },
      });
      clientMapByName.set(lower, created);
      return created;
    }

    // Helper: get or create building
    async function getOrCreateBuilding(buildingName: string, clientName?: string, address?: string, city?: string) {
      const cleanBldName = (buildingName || 'Main Facility').trim();
      const lowerBld = cleanBldName.toLowerCase();
      if (buildingMapByName.has(lowerBld)) {
        return buildingMapByName.get(lowerBld);
      }
      const client = await getOrCreateClient(clientName || `${cleanBldName} Management`);
      const created = await (db as any).building.create({
        data: {
          organizationId,
          clientId: client.id,
          name: cleanBldName,
          address: address || `${cleanBldName}, Delhi NCR`,
          city: city || 'Delhi NCR',
          complianceCycle: 'Delhi NCR Statutory Form-B (Half-Yearly)',
          cycleIntervalMos: 6,
          nextFilingDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        },
      });
      buildingMapByName.set(lowerBld, created);
      return created;
    }

    // Process rows sequentially
    for (const item of rows) {
      const { rowNumber, originalData, parsedData } = item;

      try {
        if (type === 'CLIENTS') {
          const clientName = (parsedData.name || '').trim();
          if (!clientName) {
            throw new Error('Client name cannot be empty');
          }

          const existing = clientMapByName.get(clientName.toLowerCase());
          if (existing) {
            if (duplicateStrategy === 'SKIP') {
              skippedCount++;
              continue;
            } else if (duplicateStrategy === 'UPDATE') {
              await (db as any).client.update({
                where: { id: existing.id },
                data: {
                  contactPerson: parsedData.contactPerson || existing.contactPerson,
                  phone: parsedData.phone || existing.phone,
                  email: parsedData.email || existing.email,
                },
              });
              updatedCount++;
              continue;
            }
          }

          // Create new client
          const newClient = await (db as any).client.create({
            data: {
              organizationId,
              name: clientName,
              contactPerson: parsedData.contactPerson || 'Facility SPOC',
              phone: parsedData.phone || '',
              email: parsedData.email || null,
            },
          });
          clientMapByName.set(clientName.toLowerCase(), newClient);
          importedCount++;
        } else if (type === 'BUILDINGS') {
          const buildingName = (parsedData.name || '').trim();
          if (!buildingName) {
            throw new Error('Building name cannot be empty');
          }

          const existing = buildingMapByName.get(buildingName.toLowerCase());
          if (existing) {
            if (duplicateStrategy === 'SKIP') {
              skippedCount++;
              continue;
            } else if (duplicateStrategy === 'UPDATE') {
              await (db as any).building.update({
                where: { id: existing.id },
                data: {
                  address: parsedData.address || existing.address,
                  city: parsedData.city || existing.city,
                  complianceCycle: parsedData.complianceCycle || existing.complianceCycle,
                },
              });
              updatedCount++;
              continue;
            }
          }

          const client = await getOrCreateClient(parsedData.clientName || `${buildingName} Management`);
          const newBuilding = await (db as any).building.create({
            data: {
              organizationId,
              clientId: client.id,
              name: buildingName,
              address: parsedData.address || `${buildingName}, Delhi NCR`,
              city: parsedData.city || 'Delhi NCR',
              complianceCycle: parsedData.complianceCycle || 'Delhi NCR Statutory Form-B (Half-Yearly)',
              cycleIntervalMos: 6,
              nextFilingDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
          });
          buildingMapByName.set(buildingName.toLowerCase(), newBuilding);
          importedCount++;
        } else if (type === 'FIRE_ASSETS') {
          const qrCode = (parsedData.qrCode || '').trim().toUpperCase();
          if (!qrCode) {
            throw new Error('Asset Tag / QR Code is required');
          }

          const existing = await (db as any).equipment.findFirst({
            where: {
              organizationId,
              qrCode,
            },
          });

          if (existing) {
            if (duplicateStrategy === 'SKIP') {
              skippedCount++;
              continue;
            } else if (duplicateStrategy === 'UPDATE') {
              const lastServ = parsedData.lastServiceDate ? new Date(parsedData.lastServiceDate) : existing.lastServiceDate;
              const nextDue = parsedData.nextDueDate ? new Date(parsedData.nextDueDate) : existing.nextDueDate;

              await (db as any).equipment.update({
                where: { id: existing.id },
                data: {
                  type: parsedData.type || existing.type,
                  capacity: parsedData.capacity || existing.capacity,
                  location: parsedData.location || existing.location,
                  lastServiceDate: lastServ,
                  nextDueDate: nextDue,
                  currentStatus: parsedData.currentStatus || existing.currentStatus,
                },
              });
              updatedCount++;
              continue;
            }
          }

          const building = await getOrCreateBuilding(parsedData.buildingName || 'Main Facility');
          const lastServ = parsedData.lastServiceDate ? new Date(parsedData.lastServiceDate) : new Date();
          const nextDue = parsedData.nextDueDate
            ? new Date(parsedData.nextDueDate)
            : new Date(lastServ.getTime() + 365 * 24 * 60 * 60 * 1000);

          await (db as any).equipment.create({
            data: {
              organizationId,
              buildingId: building.id,
              qrCode,
              type: parsedData.type || 'Fire Extinguisher',
              capacity: parsedData.capacity || 'ABC Dry Powder 6kg',
              location: parsedData.location || 'Building Floor',
              lastServiceDate: lastServ,
              nextDueDate: nextDue,
              currentStatus: parsedData.currentStatus || 'COMPLIANT',
            },
          });
          importedCount++;
        } else if (type === 'TECHNICIANS') {
          const email = (parsedData.email || '').trim().toLowerCase();
          if (!email) {
            throw new Error('Technician email is required');
          }

          const existing = await (db as any).userProfile.findUnique({
            where: { email },
          });

          if (existing) {
            if (duplicateStrategy === 'SKIP') {
              skippedCount++;
              continue;
            } else if (duplicateStrategy === 'UPDATE') {
              await (db as any).userProfile.update({
                where: { id: existing.id },
                data: {
                  fullName: parsedData.fullName || existing.fullName,
                  phone: parsedData.phone || existing.phone,
                  employeeId: parsedData.employeeId || existing.employeeId,
                  assignedRegion: parsedData.assignedRegion || existing.assignedRegion,
                  organizationId,
                },
              });
              updatedCount++;
              continue;
            }
          }

          // Generate unique ID for technician profile
          const techId = `tech_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await (db as any).userProfile.create({
            data: {
              id: techId,
              email,
              fullName: parsedData.fullName || 'Field Technician',
              role: 'TECHNICIAN',
              phone: parsedData.phone || '',
              employeeId: parsedData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
              assignedRegion: parsedData.assignedRegion || 'Delhi NCR',
              organizationId,
            },
          });
          importedCount++;
        } else if (type === 'INSPECTIONS') {
          const qrCode = (parsedData.equipmentQrCode || '').trim().toUpperCase();
          if (!qrCode) {
            throw new Error('Equipment QR Code is required');
          }

          let equipment = await (db as any).equipment.findFirst({
            where: { organizationId, qrCode },
            include: { building: true },
          });

          let buildingId: string;
          let equipmentId: string | null = null;

          if (equipment) {
            equipmentId = equipment.id;
            buildingId = equipment.buildingId;
          } else {
            // Auto provision equipment & building
            const bld = await getOrCreateBuilding(parsedData.buildingName || 'Main Facility');
            buildingId = bld.id;
            const newEq = await (db as any).equipment.create({
              data: {
                organizationId,
                buildingId,
                qrCode,
                type: 'Fire Extinguisher',
                capacity: 'ABC Dry Powder 6kg',
                location: 'Inspection Location',
                lastServiceDate: parsedData.date ? new Date(parsedData.date) : new Date(),
                nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                currentStatus: parsedData.status === 'PASSED' ? 'COMPLIANT' : 'OVERDUE',
              },
            });
            equipmentId = newEq.id;
          }

          await (db as any).inspection.create({
            data: {
              organizationId,
              buildingId,
              equipmentId,
              technicianName: parsedData.technicianName || 'Field Technician',
              status: parsedData.status || 'PASSED',
              date: parsedData.date ? new Date(parsedData.date) : new Date(),
              pressureGauge: parsedData.pressureGauge || 'NORMAL',
              overallCondition: parsedData.overallCondition || 'GOOD',
              remarks: parsedData.remarks || 'Spreadsheet batch audit record.',
            },
          });
          importedCount++;
        } else if (type === 'WORK_ORDERS') {
          const title = (parsedData.title || '').trim();
          if (!title) {
            throw new Error('Work order title is required');
          }

          const building = await getOrCreateBuilding(parsedData.buildingName || 'Main Facility');
          let equipmentId: string | null = null;

          if (parsedData.equipmentQrCode) {
            const eq = await (db as any).equipment.findFirst({
              where: {
                organizationId,
                qrCode: parsedData.equipmentQrCode.trim().toUpperCase(),
              },
            });
            if (eq) equipmentId = eq.id;
          }

          await (db as any).workOrder.create({
            data: {
              organizationId,
              buildingId: building.id,
              equipmentId,
              title,
              description: parsedData.description || 'Imported maintenance task from spreadsheet.',
              priority: parsedData.priority || 'MEDIUM',
              status: parsedData.status || 'OPEN',
              dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
            },
          });
          importedCount++;
        }
      } catch (err: any) {
        failedCount++;
        errors.push({
          rowNumber,
          originalData,
          errorReason: err.message || 'Failed to process row',
          suggestedCorrection: 'Check mandatory fields and ensure relationship keys are valid.',
        });
      }
    }

    // If final chunk or standalone request, write an audit log entry
    if (isFinalChunk || !batchSummary) {
      const totalImported = (batchSummary?.cumulativeImported || 0) + importedCount;
      const totalUpdated = (batchSummary?.cumulativeUpdated || 0) + updatedCount;
      const totalSkipped = (batchSummary?.cumulativeSkipped || 0) + skippedCount;
      const totalFailed = (batchSummary?.cumulativeFailed || 0) + failedCount;
      const totalProcessed = batchSummary?.totalRows || rows.length;

      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'IMPORT_BATCH',
        entityType: type,
        details: JSON.stringify({
          filename: filename || 'Direct Upload.xlsx',
          type,
          strategy: duplicateStrategy,
          totalRows: totalProcessed,
          imported: totalImported,
          updated: totalUpdated,
          skipped: totalSkipped,
          failed: totalFailed,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Error executing batch import:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
