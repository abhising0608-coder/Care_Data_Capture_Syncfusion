
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

  // In a real app, you would use the companyId to filter. 
  // For the prototype, we'll use a hardcoded ID that has data.
  const instruments: RatingInstrument[] = getInstrumentsByCompanyId('COMP-101');

  return NextResponse.json(instruments);
}
