
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FinancialInputContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ratingCycleId = searchParams.get('ratingCycleId');

    if (ratingCycleId) {
        // This is a redirect to handle both /financial-input and /financial-input/[ratingCycleId]
        router.replace(`/financial-input/${ratingCycleId}`);
        return null;
    }

    return (
        <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl font-semibold text-muted-foreground">Financial Input Page</h1>
        </div>
    );
}


export default function FinancialInputPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinancialInputContent />
    </Suspense>
  );
}
