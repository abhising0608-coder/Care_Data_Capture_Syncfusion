'use client';

import { redirect } from 'next/navigation';

export default function BankerFeedbackRedirectPage() {
    // Redirect to a default or the first available rating cycle ID
    // In a real app, you might fetch the user's portfolio and pick the first one.
    redirect('/due-diligence/banker-feedback/NOTE-001');
}
