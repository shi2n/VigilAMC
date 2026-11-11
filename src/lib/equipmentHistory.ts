import { db } from '@/lib/db';

export type EquipmentHistoryAction =
  | 'SERVICE_UPDATE'
  | 'EDIT'
  | 'PHOTO_UPDATE'
  | 'RE_SCHEDULE'
  | 'TASK_ASSIGN'
  | 'CREATE';

export type EquipmentHistoryActorRole = 'TECHNICIAN' | 'ADMIN' | 'SYSTEM';

export interface FieldChange {
  field: string;
  label?: string;
  old: any;
  new: any;
}

export async function logEquipmentHistory({
  equipmentId,
  actorName,
  actorRole,
  action,
  changes,
}: {
  equipmentId: string;
  actorName: string;
  actorRole: EquipmentHistoryActorRole;
  action: EquipmentHistoryAction;
  changes?: FieldChange[];
}) {
  try {
    if (!equipmentId) return null;
    return await (db as any).equipmentHistory.create({
      data: {
        equipmentId,
        actorName: actorName || 'System',
        actorRole: actorRole || 'SYSTEM',
        action,
        changes: changes ? (changes as any) : undefined,
      },
    });
  } catch (err: any) {
    console.error('Failed to record equipment history:', err?.message || err);
    return null;
  }
}
