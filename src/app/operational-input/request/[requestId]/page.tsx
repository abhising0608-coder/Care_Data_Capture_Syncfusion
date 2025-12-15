'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RequestDetailPage({ params }: { params: { requestId: string } }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isViewMode = mode === 'view';

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Request Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Request ID: {params.requestId}
        </p>
        <p className="text-sm text-muted-foreground">
          {isViewMode ? 'This request is in view-only mode.' : 'Data entry screen will be built here.'}
        </p>
      </div>
    </div>
  );
}
