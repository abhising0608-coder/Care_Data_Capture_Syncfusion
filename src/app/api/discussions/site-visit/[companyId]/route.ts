import { NextResponse } from 'next/server';
import { getSitePlantVisit, saveSitePlantVisit } from '@/lib/mock-data';
import type { SitePlantVisit } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const data = getSitePlantVisit(companyId);

  if (!data) {
     return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json(data);
}


export async function POST(
  request: Request,
  { params }: { params: { companyId: string } }
) {
    const { companyId } = params;
    const body = await request.json() as Partial<SitePlantVisit>;

    if (!companyId) {
         return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
    }

    const updatedDiscussion = saveSitePlantVisit(companyId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to save data' }, { status: 500 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });

}
