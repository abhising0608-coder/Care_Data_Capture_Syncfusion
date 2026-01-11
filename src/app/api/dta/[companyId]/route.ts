import { NextResponse } from 'next/server';
import { getDtasByCompanyId } from '@/lib/mock-data';
import type { DTA } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const dtas: DTA[] = getDtasByCompanyId(companyId);

  return NextResponse.json(dtas);
}
