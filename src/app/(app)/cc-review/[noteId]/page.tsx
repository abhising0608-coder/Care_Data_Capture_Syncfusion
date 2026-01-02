'use client';

import { Suspense, useRef } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Send, MessageSquareWarning } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CareCommitteeReviewPage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.noteId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    const editorRef = useRef<DocumentEditorContainer | null>(null);

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher
    );

    const handleAction = async (action: 'rework-gh' | 'approve-submit') => {
        if (!note || !user) return;

        try {
            const res = await fetch(`/api/notes/${noteId}/cc-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action, 
                    actorId: user.uid,
                 }),
            });

            if (!res.ok) {
                throw new Error(`Failed to ${action.replace('-', ' ')}`);
            }
            
            toast({
                title: 'Success',
                description: `Note has been successfully handled.`
            });

            mutate();
            router.push('/dashboard');

        } catch (error) {
            console.error('Failed to handle action:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred while processing your request.',
            });
        }
    };

    if (isLoading || !note) {
        return (
             <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-14 w-full mb-4" />
                <Skeleton className="h-[calc(100vh-250px)] w-full" />
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col">
            <header className="flex h-auto items-center justify-between gap-4 border-b bg-background p-4 sm:px-0 flex-wrap">
                <div className="flex-1">
                     <h1 className="text-xl font-semibold text-foreground">
                        Care Committee Review: {note.companyName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Review the rating note. This is a read-only view.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleAction('rework-gh')}>
                        <MessageSquareWarning className="mr-2 h-4 w-4" /> Send Back to Group Head
                    </Button>
                     <Button onClick={() => handleAction('approve-submit')}>
                        <Send className="mr-2 h-4 w-4" /> Approve & Submit to Group Head
                    </Button>
                </div>
            </header>
            <main className="flex-1 pt-6">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-250px)] w-full" />}>
                   <RatingNoteEditor 
                        ref={editorRef} 
                        isReadOnly={true}
                        content={note.editorContent}
                    />
                </Suspense>
            </main>
        </div>
    );
}
