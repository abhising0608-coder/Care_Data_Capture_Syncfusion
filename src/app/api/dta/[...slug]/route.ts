import { NextResponse } from 'next/server';
import { getDtaDiscussionById, updateDtaDiscussion } from '@/lib/mock-data';
import type { DTADiscussion } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [companyId, dtaId, discussionId] = params.slug;
  
  if(companyId && dtaId && discussionId) {
    const discussion = getDtaDiscussionById(dtaId, discussionId);
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
    const [companyId, dtaId, discussionId] = params.slug;
    const body = await request.json() as Partial<DTADiscussion>;

    if (!dtaId || !discussionId) {
         return NextResponse.json({ message: 'DTA ID and Discussion ID are required' }, { status: 400 });
    }

    const updatedDiscussion = updateDtaDiscussion(dtaId, discussionId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to update discussion' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });

}
