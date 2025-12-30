import { NextResponse } from 'next/server';
import { getCompanyInfo, saveCompanyInfo } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  // Use a default mock if no specific data exists, to ensure the page always loads
  const data = getCompanyInfo(ratingCycleId) || getCompanyInfo('COMP-101');

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

    return NextResponse.json(updatedData, { status: 200 });
}
