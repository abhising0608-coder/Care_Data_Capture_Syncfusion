import { NextResponse } from 'next/server';
import { getBankersByCompanyId } from '@/lib/mock-data';
import type { Banker } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const bankers: Banker[] = getBankersByCompanyId(companyId);

  return NextResponse.json(bankers);
}
