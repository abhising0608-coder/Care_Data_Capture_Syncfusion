
'use client';

import { redirect, useParams } from 'next/navigation';

export default function AnnexureVHistoryPage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;

    if(ratingCycleId) {
        // Redirect to the main page and the tab will be handled there
        redirect(`/manage-instrument/${ratingCycleId}?tab=annexure-v-history`);
    } else {
        redirect('/manage-instrument');
    }

    return null;
}
