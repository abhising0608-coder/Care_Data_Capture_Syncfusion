
'use client';

import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, FileDown, Loader2 } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-react-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote, RatingNoteDataSchema, Role } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { getBoundRatingNoteSfdt } from '@/lib/rating-note-service';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Define NoteStatus and UserRole types locally if they are not globally available
type NoteStatus = 'Draft' | 'Rework Requested' | 'In Review (GH)' | 'In Review (QC)' | 'QC Approved' | 'In Review (CC)' | 'CC Approved' | 'Pending RR & PR (RA)' | 'In Final Review (GH)' | 'Completed';

export default function RatingNotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.ratingCycleId as string; 
    const { toast } = useToast();
    const { user, role } = useAuth();
    
    const editorRef = useRef<DocumentEditorContainer | null>(null);
    const [boundSfdt, setBoundSfdt] = useState<string | null>(null);
    const [isBinding, setIsBinding] = useState(true);

    const { data: note, isLoading: isNoteLoading, mutate } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher
    );

    const loadAndBindData = useCallback(async () => {
        if (!note || !note.ratingNoteData) return;
        setIsBinding(true);
        try {
            const finalSfdt = await getBoundRatingNoteSfdt(note.ratingNoteData);
            setBoundSfdt(finalSfdt);
        } catch (error) {
            console.error("Failed to load or bind SFDT:", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Document',
                description: 'Could not load the document template or bind data.',
            });
            const errorSfdt = JSON.stringify({ "sections": [{"blocks":[{"inlines":[{"text":"Error: Document failed to load."}]}]}] });
            setBoundSfdt(errorSfdt);
        } finally {
            setIsBinding(false);
        }
    }, [note, toast]);

    useEffect(() => {
        if (note && note.ratingNoteData) {
            loadAndBindData();
        }
    }, [note, loadAndBindData]);

    const handleSave = async (isSubmitting: boolean = false) => {
        if (!editorRef.current || !note || !note.ratingNoteData || !user) return;
        
        const sfdtString = await editorRef.current.documentEditor.save('Sfdt');
        
        const updatedRatingNoteData: Partial<RatingNoteDataSchema> = {
            ...note.ratingNoteData,
            editorContent: sfdtString,
            audit: {
                ...note.ratingNoteData.audit,
                version: (note.ratingNoteData.audit.version || 0) + 1,
                lastSavedBy: user.displayName || 'Unknown User',
                lastSavedRole: user.role,
                lastSavedAt: new Date().toISOString(),
                changeSummary: isSubmitting ? 'Submitted to Group Head' : 'Saved draft',
            },
        };

        if (isSubmitting) {
            updatedRatingNoteData.workflowContext = {
                ...updatedRatingNoteData.workflowContext!,
                currentStage: 'GROUP_HEAD',
                status: 'In Review (GH)',
            };
        }

        try {
            const payload: Partial<RatingNote> = {
                ratingNoteData: updatedRatingNoteData as RatingNoteDataSchema,
                status: isSubmitting ? 'In Review (GH)' : note.status,
                currentActor: isSubmitting ? 'GROUP_HEAD' : note.currentActor,
            };

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
    
    const isLoading = isNoteLoading || isBinding;

    if (isLoading || !boundSfdt) {
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
                        key={note.id + (note.ratingNoteData?.audit.version || 0)} // Re-mount editor on version change
                        ref={editorRef} 
                        isReadOnly={isReadOnly}
                        content={boundSfdt}
                   />
                </Suspense>
            </main>
        </div>
    );
}
