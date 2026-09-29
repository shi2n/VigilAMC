import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { IMPORT_CONFIGS, ImportType, validateRow } from '@/lib/excelImport';

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
    const { type, rows, columnMapping } = body as {
      type: ImportType;
      rows: Record<string, any>[];
      columnMapping: Record<string, string | null>;
    };

    if (!type || !IMPORT_CONFIGS[type]) {
      return NextResponse.json({ error: `Invalid import type: ${type}` }, { status: 400 });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for validation' }, { status: 400 });
    }

    const config = IMPORT_CONFIGS[type];

    // Fetch existing records for duplicate detection under this organization
    let existingIdentifiers = new Set<string>();

    if (type === 'CLIENTS') {
      const existing = await (db as any).client.findMany({
        where: { organizationId },
        select: { name: true, email: true },
      });
      existing.forEach((c: any) => {
        if (c.name) existingIdentifiers.add(c.name.trim().toLowerCase());
        if (c.email) existingIdentifiers.add(c.email.trim().toLowerCase());
      });
    } else if (type === 'BUILDINGS') {
      const existing = await (db as any).building.findMany({
        where: { organizationId },
        select: { name: true },
      });
      existing.forEach((b: any) => {
        if (b.name) existingIdentifiers.add(b.name.trim().toLowerCase());
      });
    } else if (type === 'FIRE_ASSETS') {
      const existing = await (db as any).equipment.findMany({
        where: { organizationId },
        select: { qrCode: true },
      });
      existing.forEach((e: any) => {
        if (e.qrCode) existingIdentifiers.add(e.qrCode.trim().toUpperCase());
      });
    } else if (type === 'TECHNICIANS') {
      const existing = await (db as any).userProfile.findMany({
        where: { organizationId },
        select: { email: true, employeeId: true },
      });
      existing.forEach((u: any) => {
        if (u.email) existingIdentifiers.add(u.email.trim().toLowerCase());
        if (u.employeeId) existingIdentifiers.add(u.employeeId.trim().toUpperCase());
      });
    }

    const evaluatedRows: any[] = [];
    const seenInBatch = new Set<string>();

    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // Accounting for 1-based index and header row

      // Remap raw row keys to schema keys based on columnMapping
      const mappedRow: Record<string, any> = {};
      Object.entries(rawRow).forEach(([rawCol, val]) => {
        const targetKey = columnMapping[rawCol];
        if (targetKey) {
          mappedRow[targetKey] = val;
        }
      });

      const validation = validateRow(mappedRow, rowNumber, config);
      let isDuplicate = false;
      const warnings: string[] = [];

      // Check duplicates
      let uniqueVal = '';
      if (type === 'CLIENTS') {
        uniqueVal = (validation.parsedData.name || '').trim().toLowerCase();
      } else if (type === 'BUILDINGS') {
        uniqueVal = (validation.parsedData.name || '').trim().toLowerCase();
      } else if (type === 'FIRE_ASSETS') {
        uniqueVal = (validation.parsedData.qrCode || '').trim().toUpperCase();
      } else if (type === 'TECHNICIANS') {
        uniqueVal = (validation.parsedData.email || '').trim().toLowerCase();
      }

      if (uniqueVal) {
        if (existingIdentifiers.has(uniqueVal)) {
          isDuplicate = true;
          warnings.push(`Existing record already found in database with key "${uniqueVal}"`);
        } else if (seenInBatch.has(uniqueVal)) {
          isDuplicate = true;
          warnings.push(`Duplicate key "${uniqueVal}" repeated within this file`);
        } else {
          seenInBatch.add(uniqueVal);
        }
      }

      if (isDuplicate) {
        duplicateCount++;
      }

      if (validation.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }

      evaluatedRows.push({
        rowNumber,
        originalData: rawRow,
        parsedData: validation.parsedData,
        isValid: validation.isValid,
        isDuplicate,
        errors: validation.errors,
        warnings,
        suggestedCorrections: validation.suggestedCorrections,
      });
    });

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      validCount,
      invalidCount,
      duplicateCount,
      evaluatedRows,
    });
  } catch (error: any) {
    console.error('Error validating import data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
