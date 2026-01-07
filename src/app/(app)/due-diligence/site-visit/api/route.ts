import { NextResponse } from 'next/server';
import { siteVisitData } from '@/lib/mock-data';
import type { SiteVisit } from '@/lib/definitions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const data = siteVisitData[companyId];

  if (data) {
    return NextResponse.json(data);
  } else {
    // Return a default structure if no data exists
    const defaultData: SiteVisit = {
      companyId,
      status: 'Pending',
      isMandatory: companyId === 'COMP-101', // Example logic
      careTeam: [],
      clientPersonnel: [],
    };
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  const body = await request.json() as SiteVisit;
  const { companyId } = body;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  // In-memory update
  siteVisitData[companyId] = { ...siteVisitData[companyId], ...body };

  return NextResponse.json(siteVisitData[companyId]);
}
