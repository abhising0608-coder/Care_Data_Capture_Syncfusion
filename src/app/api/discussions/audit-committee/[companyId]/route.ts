import { NextResponse } from 'next/server';
import { getAuditCommitteeDiscussion, saveAuditCommitteeDiscussion } from '@/lib/mock-data';
import type { AuditCommitteeDiscussion } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const data = getAuditCommitteeDiscussion(companyId);

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
    const body = await request.json() as Partial<AuditCommitteeDiscussion>;

    if (!companyId) {
         return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
    }

    const updatedDiscussion = saveAuditCommitteeDiscussion(companyId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to save discussion' }, { status: 500 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });

}
