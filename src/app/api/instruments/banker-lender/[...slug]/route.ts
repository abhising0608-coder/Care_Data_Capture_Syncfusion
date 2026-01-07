
import { NextResponse } from 'next/server';
import { getBankerLenderDetails, updateBankerLenderDetails } from '@/lib/mock-data';
import type { BankerLenderDetail } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [instrumentId, rcmId] = params.slug;

  if (!instrumentId || !rcmId) {
    return NextResponse.json({ message: 'Instrument ID and RCM ID are required' }, { status: 400 });
  }

  const data = getBankerLenderDetails(instrumentId, rcmId);

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [instrumentId, rcmId] = params.slug;
  const body = await request.json() as { details: BankerLenderDetail[] };

  if (!instrumentId || !rcmId || !body.details) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  const updatedData = updateBankerLenderDetails(instrumentId, rcmId, body.details);
  if (!updatedData) {
      return NextResponse.json({ message: 'Failed to update details'}, { status: 500 });
  }

  return NextResponse.json(updatedData, { status: 200 });
}
