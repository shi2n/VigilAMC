import { NextResponse } from 'next/server';
import { POST as runComplianceCycles } from '../route';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runComplianceCycles(request);
}
