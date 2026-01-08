
'use client';

import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, FileDown, Loader2 } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote, RatingNoteDataSchema, Role, NoteStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { getBoundRatingNoteSfdt } from '@/lib/rating-note-service';
import * as template from '@/lib/rating-note-template.json';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RatingNotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.ratingCycleId as string;
    const { toast } = useToast();
    const { user, role } = useAuth();
    const editorRef = useRef<DocumentEditorContainer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [documentContent, setDocumentContent] = useState<string | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(true);


    const { data: note, isLoading: isNoteLoading, mutate } = useSWR<RatingNote>(
        noteId ? `/api/notes/${noteId}` : null,
        fetcher
    );
    
    useEffect(() => {
        const loadContent = async () => {
            if (!note) return;

            // Use existing content if valid
            if (note.editorContent && note.editorContent.length > 50) {
                console.log("Loading existing editor content.");
                try {
                    JSON.parse(note.editorContent);
                    setDocumentContent(note.editorContent);
                } catch (e) {
                     console.error("Existing editor content is invalid, falling back to template binding.", e);
                     const boundSfdt = await getBoundRatingNoteSfdt(template, note.ratingNoteData!);
                     setDocumentContent(boundSfdt);
                }
            } else if (note.ratingNoteData) {
                // Otherwise, bind data to the template
                console.log("No valid existing content found. Starting new data binding process.");
                const boundSfdt = await getBoundRatingNoteSfdt(template, note.ratingNoteData);
                setDocumentContent(boundSfdt);
            } else {
                 // Fallback for incomplete data
                 console.warn("Note data is incomplete. Loading a default document.");
                 const defaultContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" });
                 setDocumentContent(defaultContent);
            }
            setIsLoadingContent(false);
        };

        if (note) {
            loadContent();
        }
    }, [note]);
    
    const handleSave = async (isSubmitting: boolean = false) => {
        if (!editorRef.current || !note || !user) return;

        setIsSubmitting(true);
        const action = isSubmitting ? 'submit-to-gh' : 'save-draft';
        
        try {
            const documentContentBlob = await editorRef.current.documentEditor.saveAsBlob('Sfdt');
            const reader = new FileReader();

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
                    throw new Error(`Failed to ${isSubmitting ? 'submit' : 'save'}`);
                }

                toast({
                    title: 'Success!',
                    description: `Rating note has been ${isSubmitting ? 'submitted to Group Head' : 'saved as a draft'}.`,
                });

                mutate();

                if (isSubmitting) {
                    router.push('/dashboard');
                }
                 setIsSubmitting(false);
            };

            reader.readAsText(documentContentBlob);

        } catch (error) {
            console.error("Failed to save/submit:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save or submit the rating note.',
            });
            setIsSubmitting(false);
        }
    };
    
    const handleSubmitToGroupHead = () => {
        handleSave(true);
    };

    const handleExport = (format: 'Docx' | 'Pdf') => {
        if (!editorRef.current) {
            toast({
                variant: "destructive",
                title: "Editor not ready",
                description: "The document editor is not available to perform this action."
            });
            return;
        }
        const fileName = `${note?.companyName}_RatingNote`;
        editorRef.current.documentEditor.save(fileName, format);
    };

    const canEdit = (userRole: Role | undefined, noteStatus: NoteStatus | undefined) => {
        if (!userRole || !noteStatus) return false;
        if (userRole === 'RATING_ANALYST' && noteStatus === 'Draft') {
            return true;
        }
        return false;
    };

    const isReadOnly = !canEdit(user?.role, note?.status as NoteStatus);

    if (isNoteLoading || !note || isLoadingContent || !documentContent) {
        return (
            <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center flex-col h-[calc(100vh-250px)] w-full bg-muted/50 rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-foreground">Preparing Document...</p>
                    <p className="text-muted-foreground">Fetching template and binding data, please wait.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col">
            <header className="flex h-auto items-center justify-between gap-4 border-b bg-background p-4 sm:px-0 flex-wrap">
                <div className="flex-1">
                    <h1 className="text-xl font-semibold text-foreground">
                        Rating Note: {note.companyName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isReadOnly ? `Status: ${note.status}. This note is locked.` : 'Prepare the final rating note draft.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleExport('Docx')}>
                        <FileDown className="mr-2 h-4 w-4" /> Export as DOCX
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('Pdf')}>
                        <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                    </Button>
                    {!isReadOnly && (
                        <>
                            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" /> Save Draft
                            </Button>
                            <Button onClick={handleSubmitToGroupHead} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Submit to Group Head
                            </Button>
                        </>
                    )}
                </div>
            </header>
            <main className="flex-1 pt-6">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-250px)] w-full" />}>
                   <RatingNoteEditor
                        key={note.id + (note.ratingNoteData?.audit.version || 1)}
                        ref={editorRef}
                        isReadOnly={isReadOnly}
                        content={documentContent}
                    />
                </Suspense>
            </main>
        </div>
    );
}
