import { NextResponse } from 'next/server';
import { getAuditorsByCompanyId } from '@/lib/mock-data';
import type { Auditor } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const auditors: Auditor[] = getAuditorsByCompanyId(companyId);

  return NextResponse.json(auditors);
}
