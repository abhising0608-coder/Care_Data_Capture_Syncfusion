'use client';

import { Suspense } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Save, Send } from 'lucide-react';
import { useWorkflow } from '@/context/workflow-context';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { CKCRequest } from '@/lib/definitions';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RatingNotePage() {
    const params = useParams();
    const router = useRouter();
    const ratingCycleId = params.ratingCycleId as string;
    const { completeStep } = useWorkflow();
    
    const { data: request, isLoading } = useSWR<CKCRequest>(
      ratingCycleId ? `/api/requests/${ratingCycleId}` : null,
      fetcher
    );

    const handleSave = () => {
        alert('Save functionality to be implemented.');
    };
    
    const handleDownload = () => {
        alert('Download functionality to be implemented.');
    }

    const handleSubmitForReview = () => {
      // In a real app, this would change the workflow state
      alert('Submitting for review. Status will be updated to "In Review".');
      completeStep('rating-note');
      router.push('/dashboard');
    }

    return (
        <div className="flex h-full w-full flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-0">
                <div className="flex-1">
                     <h1 className="text-xl font-semibold text-foreground">
                        Rating Note
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Step 5: Prepare the final rating note draft.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                     <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                     <Button onClick={handleSubmitForReview}>
                        <Send className="mr-2 h-4 w-4" /> Submit for Review
                    </Button>
                </div>
            </header>
            <main className="flex-1 pt-6">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-250px)] w-full" />}>
                   <RatingNoteEditor />
                </Suspense>
            </main>
        </div>
    );
}
