'use client';

import { Suspense } from 'react';
import { OperationalInputForm } from '@/components/operational-input/operational-input-form';

export default function InitiateOperationalInputPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Operational Input Initiation
        </h1>
        <p className="text-muted-foreground">
          Configure the parameters for operational data entry.
        </p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
        <OperationalInputForm />
      </Suspense>
    </div>
  );
}
