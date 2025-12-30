import { NextResponse } from 'next/server';
import { getCompanyInfo, saveCompanyInfo } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  const data = getCompanyInfo(ratingCycleId);

  if (!data) {
    return NextResponse.json({ message: 'Company info not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
    const { ratingCycleId } = params;
    const body = await request.json();

    const updatedData = saveCompanyInfo(ratingCycleId, body);

    return NextResponse.json(updatedData);
}
