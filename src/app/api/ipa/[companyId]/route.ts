import { NextResponse } from 'next/server';
import { getIpasByCompanyId } from '@/lib/mock-data';
import type { IPA } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const ipas: IPA[] = getIpasByCompanyId(companyId);

  return NextResponse.json(ipas);
}
