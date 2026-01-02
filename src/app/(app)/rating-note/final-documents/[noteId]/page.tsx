'use client';

import { Suspense, useRef, useState } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Save, Send, FileText, Newspaper } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function FinalDocumentsPage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.noteId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    const rnEditorRef = useRef<DocumentEditorContainer | null>(null);
    const rrEditorRef = useRef<DocumentEditorContainer | null>(null);
    const prEditorRef = useRef<DocumentEditorContainer | null>(null);

    const [rrGenerated, setRrGenerated] = useState(false);
    const [prGenerated, setPrGenerated] = useState(false);

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher
    );
    
    const handleGenerate = (docType: 'rr' | 'pr') => {
        if (docType === 'rr') {
            setRrGenerated(true);
            toast({ title: 'Success', description: 'Rating Rationale editor is now available.' });
        } else if (docType === 'pr') {
             if (!rrGenerated) {
                toast({ variant: 'destructive', title: 'Error', description: 'Please generate the Rating Rationale before generating the Press Release.' });
                return;
            }
            setPrGenerated(true);
            toast({ title: 'Success', description: 'Press Release editor is now available.' });
        }
    };
    
    const handleFinalSubmit = async () => {
        if (!rrEditorRef.current || !prEditorRef.current || !note || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Ensure all documents are generated and ready.' });
            return;
        }

        try {
            const rrContentBlob = await rrEditorRef.current.documentEditor.saveAsBlob('Sfdt');
            const prContentBlob = await prEditorRef.current.documentEditor.saveAsBlob('Sfdt');
            
            const rrContent = await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsText(rrContentBlob);
            });

            const prContent = await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsText(prContentBlob);
            });

            const res = await fetch(`/api/notes/${noteId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'In Final Review (GH)',
                    rrContent,
                    prContent,
                 }),
            });

            if (!res.ok) throw new Error('Failed to submit final documents');

            toast({ title: 'Success', description: 'All final documents have been submitted to the Group Head.' });
            mutate();
            router.push('/dashboard');

        } catch (error) {
            console.error('Final submission failed:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit final documents.' });
        }
    };


    if (isLoading || !note) {
        return (
             <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-8 space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[calc(100vh-250px)] w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header className="flex h-auto items-center justify-between gap-4 flex-wrap">
                <div className="flex-1">
                     <h1 className="text-2xl font-semibold text-foreground">
                        Final Documents Generation: {note.companyName}
                    </h1>
                    <p className="text-muted-foreground">
                        Generate the Rating Rationale (RR) and Press Release (PR). The Rating Note is read-only.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleFinalSubmit}
                        disabled={!rrGenerated || !prGenerated}
                    >
                        <Send className="mr-2 h-4 w-4" /> Submit All to Group Head
                    </Button>
                </div>
            </header>

            <Tabs defaultValue="rating-note" className="w-full">
                <TabsList>
                    <TabsTrigger value="rating-note"><FileText className="mr-2 h-4 w-4" />Rating Note (Read-only)</TabsTrigger>
                    <TabsTrigger value="rating-rationale" disabled={!rrGenerated}><FileText className="mr-2 h-4 w-4" />Rating Rationale</TabsTrigger>
                    <TabsTrigger value="press-release" disabled={!prGenerated}><Newspaper className="mr-2 h-4 w-4" />Press Release</TabsTrigger>
                </TabsList>
                
                <TabsContent value="rating-note">
                    <Card>
                        <CardHeader><CardTitle>Approved Rating Note</CardTitle></CardHeader>
                        <CardContent>
                             <RatingNoteEditor ref={rnEditorRef} isReadOnly={true} content={note.editorContent} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rating-rationale">
                     <Card>
                        <CardHeader><CardTitle>Rating Rationale (RR)</CardTitle></CardHeader>
                        <CardContent>
                            <RatingNoteEditor ref={rrEditorRef} isReadOnly={false} content={note.rrContent} />
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="press-release">
                     <Card>
                        <CardHeader><CardTitle>Press Release (PR)</CardTitle></CardHeader>
                        <CardContent>
                            <RatingNoteEditor ref={prEditorRef} isReadOnly={false} content={note.prContent} />
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Generate Rating Rationale</CardTitle>
                        <CardDescription>
                            Auto-populate and edit the RR based on the approved Rating Note.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button onClick={() => handleGenerate('rr')} disabled={rrGenerated}>
                            <FileText className="mr-2 h-4 w-4" />
                            {rrGenerated ? 'RR Generated' : 'Generate Rating Rationale'}
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Generate Press Release</CardTitle>
                        <CardDescription>
                            Auto-populate and edit the PR based on the RR and RN.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button onClick={() => handleGenerate('pr')} disabled={!rrGenerated || prGenerated}>
                             <Newspaper className="mr-2 h-4 w-4" />
                            {prGenerated ? 'PR Generated' : 'Generate Press Release'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
