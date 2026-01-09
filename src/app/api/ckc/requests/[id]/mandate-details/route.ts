import { NextResponse } from 'next/server';
import { getMandateDetailsByRequestId } from '@/lib/mock-data';
import type { CkcMandateDetails } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
  }

  const data = getMandateDetailsByRequestId(id);

  if (!data) {
    return NextResponse.json({ message: 'Data not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
