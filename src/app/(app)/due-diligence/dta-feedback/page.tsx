'use client';

import { redirect } from 'next/navigation';

export default function DtaFeedbackRedirectPage() {
    // Redirect to a default or the first available rating cycle ID
    redirect('/due-diligence/dta-feedback/NOTE-001');
}
