
'use client';

import { redirect, useParams } from 'next/navigation';

export default function PressReleaseHistoryPage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;
    
    if(ratingCycleId) {
        redirect(`/manage-instrument/${ratingCycleId}?tab=press-release-history`);
    } else {
        redirect('/manage-instrument');
    }
    
    return null;
}
