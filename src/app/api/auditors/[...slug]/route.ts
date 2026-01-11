import { NextResponse } from 'next/server';
import { getAuditorsByCompanyId, getAuditorDiscussionById, updateAuditorDiscussion } from '@/lib/mock-data';
import type { Auditor, AuditorDiscussion } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [companyId, auditorId, discussionId] = params.slug;

  if (companyId && !auditorId) {
    const auditors: Auditor[] = getAuditorsByCompanyId(companyId);
    return NextResponse.json(auditors);
  }
  
  if(companyId && auditorId && discussionId) {
    const discussion = getAuditorDiscussionById(auditorId, discussionId);
    if (!discussion) {
       return NextResponse.json({ message: 'Discussion not found' }, { status: 404 });
    }
    return NextResponse.json(discussion);
  }

  return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });
}


export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
    const [companyId, auditorId, discussionId] = params.slug;
    const body = await request.json() as Partial<AuditorDiscussion>;

    if (!auditorId || !discussionId) {
         return NextResponse.json({ message: 'Auditor ID and Discussion ID are required' }, { status: 400 });
    }

    const updatedDiscussion = updateAuditorDiscussion(auditorId, discussionId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to update discussion' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });

}
