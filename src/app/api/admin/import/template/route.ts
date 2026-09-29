import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentUser } from '@/lib/auth';
import { IMPORT_CONFIGS, ImportType, generateSampleWorkbook } from '@/lib/excelImport';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.user || auth.profile?.role === 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'FIRE_ASSETS').toUpperCase() as ImportType;

    if (!IMPORT_CONFIGS[type]) {
      return NextResponse.json({ error: `Invalid import type: ${type}` }, { status: 400 });
    }

    const wb = generateSampleWorkbook(type);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `VigilAMC_Template_${IMPORT_CONFIGS[type].plural.replace(/\s+/g, '_')}.xlsx`;

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
