
'use client';

import { Suspense } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { CKCRequest } from '@/lib/definitions';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RatingNotePage() {
    const params = useParams();
    const requestId = params.requestId as string;
    
    const { data: request, isLoading } = useSWR<CKCRequest>(
      requestId ? `/api/requests/${requestId}` : null,
      fetcher
    );

    const handleSave = () => {
        // Logic to get content from editor and save
        alert('Save functionality to be implemented.');
    };
    
    const handleDownload = () => {
        // Logic to download the document as .docx
        alert('Download functionality to be implemented.');
    }

    return (
        <div className="flex h-full w-full flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/rating-note">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <div className="flex-1">
                    {isLoading ? (
                         <Skeleton className="h-6 w-1/2" />
                    ) : (
                        <h1 className="text-xl font-semibold text-foreground">
                            Rating Note: {request?.companyName} ({requestId})
                        </h1>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Version
                    </Button>
                     <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-200px)] w-full" />}>
                   <RatingNoteEditor />
                </Suspense>
            </main>
        </div>
    );
}

