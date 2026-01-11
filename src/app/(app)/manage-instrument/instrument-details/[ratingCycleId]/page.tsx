
'use client';

import { redirect, useParams } from 'next/navigation';

export default function InstrumentDetailsPageWithId() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;
    
    // Redirect to the main manage-instrument page which now handles tabs
    if(ratingCycleId) {
        redirect(`/manage-instrument/${ratingCycleId}`);
    } else {
        redirect('/manage-instrument');
    }
    
    return null;
}
