'use client';

import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, FileDown, Loader2 } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-react-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { getBoundRatingNoteSfdt } from '@/lib/rating-note-service';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RatingNotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.ratingCycleId as string; 
    const { toast } = useToast();
    const { user, role } = useAuth();
    
    const editorRef = useRef<DocumentEditorContainer | null>(null);
    const [boundSfdt, setBoundSfdt] = useState<string | null>(null);
    const [isBinding, setIsBinding] = useState(true);

    const { data: note, isLoading: isNoteLoading } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher
    );

    const loadAndBindData = useCallback(async () => {
        if (!note) return;
        setIsBinding(true);
        try {
            const finalSfdt = await getBoundRatingNoteSfdt(note);
            setBoundSfdt(finalSfdt);
        } catch (error) {
            console.error("Failed to load or bind SFDT:", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Document',
                description: 'Could not load the document template or bind data.',
            });
            // Load an error message into the editor
            setBoundSfdt(JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Document failed to load.\"}]}]}]}" }));
        } finally {
            setIsBinding(false);
        }
    }, [note, toast]);

    useEffect(() => {
        if (note) {
            loadAndBindData();
        }
    }, [note, loadAndBindData]);

    const handleSave = async (isSubmitting: boolean = false) => {
        if (!editorRef.current || !note || !user) return;
        
        // Serialize the document content from the editor
        const sfdtString = await editorRef.current.documentEditor.save('Sfdt');
        
        let payload: Partial<RatingNote> = {
            editorContent: sfdtString,
        };
        
        if (isSubmitting) {
            payload.status = 'In Review (GH)';
            payload.currentActor = 'GROUP_HEAD'; 
        }

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

    if (isLoading) {
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
                        ref={editorRef} 
                        isReadOnly={isReadOnly}
                        content={boundSfdt} // Pass the bound SFDT to the editor
                   />
                </Suspense>
            </main>
        </div>
    );
}
