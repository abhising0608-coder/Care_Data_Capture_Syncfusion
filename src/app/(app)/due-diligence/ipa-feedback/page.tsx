'use client';

import { redirect } from 'next/navigation';

export default function IpaFeedbackRedirectPage() {
    // Redirect to a default or the first available rating cycle ID
    redirect('/due-diligence/ipa-feedback/NOTE-001');
}
