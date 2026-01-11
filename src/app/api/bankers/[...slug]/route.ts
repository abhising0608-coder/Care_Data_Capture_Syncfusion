import { NextResponse } from 'next/server';
import { getBankerDiscussionById, updateBankerDiscussion } from '@/lib/mock-data';
import type { Banker, BankerDiscussion } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const [companyId, bankerId, discussionId] = params.slug;
  
  if(companyId && bankerId && discussionId) {
    const discussion = getBankerDiscussionById(bankerId, discussionId);
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
    const [companyId, bankerId, discussionId] = params.slug;
    const body = await request.json() as Partial<BankerDiscussion>;

    if (!bankerId || !discussionId) {
         return NextResponse.json({ message: 'Banker ID and Discussion ID are required' }, { status: 400 });
    }

    const updatedDiscussion = updateBankerDiscussion(bankerId, discussionId, body);

    if (!updatedDiscussion) {
        return NextResponse.json({ message: 'Failed to update discussion' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDiscussion, { status: 200 });

}
