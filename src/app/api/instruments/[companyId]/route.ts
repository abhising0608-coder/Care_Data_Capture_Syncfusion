import { NextResponse } from 'next/server';
import { getInstrumentsByCompanyId } from '@/lib/mock-data';
import type { RatingInstrument } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  
  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const instruments: RatingInstrument[] = getInstrumentsByCompanyId(companyId);

  return NextResponse.json(instruments);
}
