'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, MessageSquareWarning } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GroupHeadReviewPage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.noteId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    // Ref to access the editor's instance
    const editorRef = useRef<DocumentEditorContainer | null>(null);

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher
    );

    const handleAction = async (action: 'rework' | 'submit-to-qc') => {
        if (!editorRef.current || !note || !user) return;

        try {
            // Save the document content from the editor
            const documentContent = await editorRef.current.documentEditor.saveAsBlob('Sfdt');
            const reader = new FileReader();
            reader.readAsText(documentContent);
            
            reader.onloadend = async () => {
                const sfdtString = reader.result as string;

                const res = await fetch(`/api/notes/${noteId}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action, 
                        editorContent: sfdtString,
                        actorId: user.uid,
                     }),
                });

                if (!res.ok) {
                    throw new Error(`Failed to ${action.replace('-', ' ')}`);
                }
                
                toast({
                    title: 'Success',
                    description: `Note has been successfully ${action === 'rework' ? 'sent back for rework' : 'submitted to QC'}.`
                });

                // Mutate the local data to reflect the change, then navigate
                mutate();
                router.push('/dashboard');
            };

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
                        Group Head Review: {note.companyName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Review the rating note. You can edit the document directly; changes will be tracked.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleAction('rework')}>
                        <MessageSquareWarning className="mr-2 h-4 w-4" /> Rework
                    </Button>
                     <Button onClick={() => handleAction('submit-to-qc')}>
                        <Send className="mr-2 h-4 w-4" /> Submit to QC
                    </Button>
                </div>
            </header>
            <main className="flex-1 pt-6">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-250px)] w-full" />}>
                   <RatingNoteEditor 
                        ref={editorRef} 
                        isReadOnly={false} // Group Head can edit
                        content={note.editorContent} // Pass the content to the editor
                    />
                </Suspense>
            </main>
        </div>
    );
}
