import { NextResponse } from 'next/server';
import { getManagementDiscussion, saveManagementDiscussion } from '@/lib/mock-data';
import type { ManagementDiscussion } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const data = getManagementDiscussion(companyId);

  if (!data) {
     return NextResponse.json(null, { status: 200 }); // Return null if no data, but not an error
  }

  return NextResponse.json(data);
}


export async function POST(
  request: Request,
  { params }: { params: { companyId: string } }
) {
    const { companyId } = params;
    const body = await request.json() as Partial<ManagementDiscussion>;

    if (!companyId) {
         return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
    }

    const updatedDiscussion = saveManagementDiscussion(companyId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to save discussion' }, { status: 500 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });

}
