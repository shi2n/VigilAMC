import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentUser } from '@/lib/auth';
import {
  IMPORT_CONFIGS,
  ImportType,
  generateSampleWorkbook,
  generateSampleCsv,
  getTemplateFilename,
} from '@/lib/excelImport';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.user || auth.profile?.role === 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'FIRE_ASSETS').toUpperCase() as ImportType;
    const format = (searchParams.get('format') || 'xlsx').toLowerCase() === 'csv' ? 'csv' : 'xlsx';

    if (!IMPORT_CONFIGS[type]) {
      return NextResponse.json({ error: `Invalid import type: ${type}` }, { status: 400 });
    }

    const filename = getTemplateFilename(type, format);

    if (format === 'csv') {
      const csv = generateSampleCsv(type);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    const wb = generateSampleWorkbook(type);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating import template:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
