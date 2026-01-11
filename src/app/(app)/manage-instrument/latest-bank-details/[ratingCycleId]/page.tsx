
'use client';

import { redirect, useParams } from 'next/navigation';

export default function LatestBankDetailsPage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;

    if(ratingCycleId) {
        redirect(`/manage-instrument/${ratingCycleId}?tab=latest-bank-details`);
    } else {
        redirect('/manage-instrument');
    }

    return null;
}
