import { NextResponse } from 'next/server';
import { getIpaDiscussionById, updateIpaDiscussion } from '@/lib/mock-data';
import type { IPADiscussion } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [companyId, ipaId, discussionId] = params.slug;
  
  if(companyId && ipaId && discussionId) {
    const discussion = getIpaDiscussionById(ipaId, discussionId);
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
    const [companyId, ipaId, discussionId] = params.slug;
    const body = await request.json() as Partial<IPADiscussion>;

    if (!ipaId || !discussionId) {
         return NextResponse.json({ message: 'IPA ID and Discussion ID are required' }, { status: 400 });
    }

    const updatedDiscussion = updateIpaDiscussion(ipaId, discussionId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to update discussion' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });
}
