
'use client';

import { redirect, useParams } from 'next/navigation';

export default function DMSDocumentHistoryPage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;

    if(ratingCycleId) {
        redirect(`/manage-instrument/${ratingCycleId}?tab=dms-document-history`);
    } else {
        redirect('/manage-instrument');
    }
    
    return null;
}
