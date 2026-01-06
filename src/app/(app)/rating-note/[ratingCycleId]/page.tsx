
'use client';

import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, FileDown, Loader2 } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote, RatingNoteDataSchema, Role } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { getDecompressedSfdt } from '@/lib/rating-note-service';
import * as template from '@/lib/rating-note-template.json';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Define NoteStatus and UserRole types locally if they are not globally available
type NoteStatus = 'Draft' | 'Rework Requested' | 'In Review (GH)' | 'In Review (QC)' | 'QC Approved' | 'In Review (CC)' | 'CC Approved' | 'Pending RR & PR (RA)' | 'In Final Review (GH)' | 'Completed';

export default function RatingNotePage() {
    console.log("=== RatingNotePage component rendering ===");

    const params = useParams();
    const router = useRouter();
    const noteId = params.ratingCycleId as string;
    console.log("Note ID from params:", noteId);

    const { toast } = useToast();
    const { user, role } = useAuth();
    console.log("User:", user, "Role:", role);

    const editorRef = useRef<DocumentEditorContainer | null>(null);
    const [documentContent, setDocumentContent] = useState<string | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(true);

    const { data: note, isLoading: isNoteLoading, mutate } = useSWR<RatingNote>(
        noteId ? `/api/notes/${noteId}` : null,
        fetcher
    );

    console.log("Note data:", note, "isNoteLoading:", isNoteLoading);

    useEffect(() => {
        console.log("=== useEffect for loading content triggered ===");
        console.log("Toast function available:", !!toast);

        const loadContent = async () => {
            console.log("Starting loadContent function...");
            setIsLoadingContent(true);
            try {
                console.log("Calling getDecompressedSfdt()...");

                const base64String = (template as any);
                const decompressedSfdt = JSON.stringify(base64String);
                setDocumentContent(decompressedSfdt);
                console.log("Document content state updated!");
            } catch (error) {
                console.error("!!! ERROR in loadContent !!!", error);
                console.error("Error details:", JSON.stringify(error, null, 2));
                toast({
                    variant: 'destructive',
                    title: 'Error Loading Document',
                    description: 'Could not load the document content.',
                });
            } finally {
                console.log("Setting isLoadingContent to false");
                setIsLoadingContent(false);
            }
        };

        loadContent();
    }, [toast]);


    const handleSave = async (isSubmitting: boolean = false) => {
        if (!editorRef.current || !note || !user) return;

        const sfdtString = await editorRef.current.documentEditor.save('Sfdt');

        const payload: Partial<RatingNote> = {
            editorContent: sfdtString,
            status: isSubmitting ? 'In Review (GH)' : note.status,
            currentActor: isSubmitting ? 'GROUP_HEAD' : note.currentActor,
        };

        try {
            await fetch(`/api/notes/${noteId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            toast({
                title: 'Success!',
                description: `Rating note has been ${isSubmitting ? 'submitted to Group Head' : 'saved'}.`,
            });

            mutate();

            if (isSubmitting) {
                router.push('/dashboard');
            }
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

    const isLoading = isNoteLoading || isLoadingContent;

    if (isLoading || !documentContent) {
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

    const canEdit = (userRole: Role | undefined, noteStatus: NoteStatus) => {
        if (!userRole) return false;
        if (userRole === 'RATING_ANALYST' && (noteStatus === 'Draft' || noteStatus === 'Rework Requested')) {
            return true;
        }
        return false;
    };

    const isReadOnly = !canEdit(user?.role, note.status as NoteStatus);

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
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleExport('Docx')}>
                        <FileDown className="mr-2 h-4 w-4" /> Export as DOCX
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('Pdf')}>
                        <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                    </Button>
                    {!isReadOnly && (
                        <>
                            <Button variant="outline" onClick={() => handleSave(false)}>
                                <Save className="mr-2 h-4 w-4" /> Save Draft
                            </Button>
                            <Button onClick={handleSubmitToGroupHead}>
                                <Send className="mr-2 h-4 w-4" /> Submit to Group Head
                            </Button>
                        </>
                    )}
                </div>
            </header>
            <main className="flex-1 pt-6">
                <Suspense fallback={<Skeleton className="h-[calc(100vh-250px)] w-full" />}>
                    <RatingNoteEditor
                        key={note.id}
                        ref={editorRef}
                        isReadOnly={isReadOnly}
                        content={documentContent}
                    />
                </Suspense>
            </main>
        </div>
    );
}
