'use client';

import { Suspense, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RatingNotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.ratingCycleId as string; 
    const { mutate } = useSWRConfig();
    const { toast } = useToast();
    const { user } = useAuth();
    
    // Ref to access the editor's instance
    const editorRef = useRef<DocumentEditorContainer | null>(null);

    const { data: note, isLoading } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher
    );

    const handleSave = async (isSubmitting: boolean = false) => {
        if (!editorRef.current || !note || !user) return;
        
        try {
            // Save the document content from the editor
            const documentContent = await editorRef.current.documentEditor.saveAsBlob('Sfdt');
            const reader = new FileReader();
            reader.readAsText(documentContent);

            reader.onloadend = async () => {
                const sfdtString = reader.result as string;
                
                let payload: Partial<RatingNote> = {
                    editorContent: sfdtString,
                };
                
                if (isSubmitting) {
                    payload.status = 'In Review (GH)';
                    // Assign to a group head. Hardcoded for prototype.
                    payload.ghId = 'group.head@careedge'; 
                }

                await fetch(`/api/notes/${noteId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                
                mutate(`/api/notes/${noteId}`); // Revalidate local data

                toast({
                    title: 'Success!',
                    description: `Rating note has been ${isSubmitting ? 'submitted to Group Head' : 'saved'}.`,
                });

                if (isSubmitting) {
                    router.push('/dashboard');
                }
            };
        } catch (error) {
            console.error("Failed to save/submit:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save the rating note.',
            });
        }
    };
    
    const handleSubmitToGroupHead = () => {
      handleSave(true);
    }
    
    if (isLoading) {
      return (
         <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-14 w-full mb-4" />
            <Skeleton className="h-[calc(100vh-250px)] w-full" />
        </div>
      )
    }

    // Determine if the note should be read-only for the RA
    const isReadOnly = note?.status !== 'Draft' && note?.status !== 'Rework Requested';

    return (
        <div className="flex h-full w-full flex-col">
            <header className="flex h-auto items-center justify-between gap-4 border-b bg-background p-4 sm:px-0 flex-wrap">
                <div className="flex-1">
                     <h1 className="text-xl font-semibold text-foreground">
                        Rating Note: {note?.companyName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isReadOnly ? `Status: ${note?.status}. This note is locked.` : 'Prepare the final rating note draft.'}
                    </p>
                </div>
                {!isReadOnly && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleSave(false)}>
                            <Save className="mr-2 h-4 w-4" /> Save Draft
                        </Button>
                        <Button onClick={handleSubmitToGroupHead}>
                            <Send className="mr-2 h-4 w-4" /> Submit to Group Head
                        </Button>
                    </div>
                )}
            </header>
            <main className="flex-1 pt-6">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-250px)] w-full" />}>
                   <RatingNoteEditor 
                        ref={editorRef} 
                        isReadOnly={isReadOnly}
                        content={note?.editorContent}
                   />
                </Suspense>
            </main>
        </div>
    );
}
