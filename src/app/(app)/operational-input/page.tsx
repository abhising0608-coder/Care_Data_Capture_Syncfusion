'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page now primarily serves to redirect to the initiate screen.
// A more robust implementation might show a list of ongoing entries.
export default function OperationalInputPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/operational-input/initiate');
  }, [router]);

  return (
     <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting to initiation screen...</p>
    </div>
  );
}
