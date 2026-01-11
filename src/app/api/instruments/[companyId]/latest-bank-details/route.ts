
import { NextResponse } from 'next/server';
import { getLatestBankDetailsByCompanyId } from '@/lib/mock-data';
import type { LatestBankDetail } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  
  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const details: LatestBankDetail[] = getLatestBankDetailsByCompanyId(companyId);

  return NextResponse.json(details);
}
