'use client';

import { redirect } from 'next/navigation';

export default function AuditorFeedbackRedirectPage() {
    // Redirect to a default or the first available rating cycle ID
    // In a real app, you might fetch the user's portfolio and pick the first one.
    redirect('/due-diligence/auditor-feedback/NOTE-001');
}
