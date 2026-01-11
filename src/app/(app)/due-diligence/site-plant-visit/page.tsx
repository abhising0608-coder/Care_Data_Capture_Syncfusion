
'use client';

import { redirect, useParams } from 'next/navigation';

export default function SitePlantVisitRedirectPage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;

    // Redirect to a default or the first available rating cycle ID
    if (ratingCycleId) {
        redirect(`/due-diligence/site-plant-visit/${ratingCycleId}`);
    } else {
        // Fallback if no ID is present, though this is unlikely in the workflow
        redirect('/due-diligence/site-plant-visit/NOTE-001');
    }
}
