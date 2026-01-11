
import { NextResponse } from 'next/server';
import { getIsinRecords, updateIsinRecord } from '@/lib/mock-data';
import type { ISINRecord } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [companyId, instrumentId, rcmId] = params.slug;

  if (!instrumentId || !rcmId) {
    return NextResponse.json({ message: 'Instrument ID and RCM ID are required' }, { status: 400 });
  }

  const data = getIsinRecords(instrumentId, rcmId);

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [companyId, instrumentId, rcmId] = params.slug;
  const body = await request.json() as { isinRecords: ISINRecord[] };

  if (!instrumentId || !rcmId || !body.isinRecords) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  const updatedData = updateIsinRecord(instrumentId, rcmId, body.isinRecords);
  return NextResponse.json(updatedData, { status: 200 });
}
