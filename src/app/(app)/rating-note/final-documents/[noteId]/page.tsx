
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

// Default empty content for new documents
const newDocContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting here...\"}]}]}]}" });

export default function FinalDocumentsPage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.noteId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    const rnEditorRef = useRef<DocumentEditorContainer | null>(null);
    const prEditorRef = useRef<DocumentEditorContainer | null>(null);

    const [prContent, setPrContent] = useState<string | undefined>(undefined);
    const [prGenerated, setPrGenerated] = useState(false);

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher,
      {
          onSuccess: (data) => {
              if (data.prContent) {
                  setPrContent(data.prContent);
                  setPrGenerated(true);
              }
          }
      }
    );
    
    const handleGenerate = () => {
        setPrContent(note?.prContent || newDocContent);
        setPrGenerated(true);
        toast({ title: 'Success', description: 'Press Release editor is now available.' });
    };
    
    const handleFinalSubmit = async () => {
        if (!prEditorRef.current || !note || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Ensure all documents are generated and ready.' });
            return;
        }

        try {
            const prContentBlob = await prEditorRef.current.documentEditor.saveAsBlob('Sfdt');
            
            const finalPrContent = await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsText(prContentBlob);
            });

            const res = await fetch(`/api/notes/${noteId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'submit-pr',
                    actorId: user.uid,
                    prContent: finalPrContent,
                 }),
            });

            if (!res.ok) throw new Error('Failed to submit final documents');

            toast({ title: 'Success', description: 'Press Release has been generated and saved.' });
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
                        Press Release Generation: {note.companyName}
                    </h1>
                    <p className="text-muted-foreground">
                        Generate the Press Release (PR). The Rating Note is read-only.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    {!prGenerated ? (
                        <Button onClick={handleGenerate}>
                            <Newspaper className="mr-2 h-4 w-4" /> Generate PR
                        </Button>
                    ) : (
                        <Button onClick={handleFinalSubmit}>
                            <Send className="mr-2 h-4 w-4" /> Submit PR
                        </Button>
                    )}
                </div>
            </header>

            <Tabs defaultValue="rating-note" className="w-full">
                <TabsList>
                    <TabsTrigger value="rating-note"><FileText className="mr-2 h-4 w-4" />Rating Note (Read-only)</TabsTrigger>
                    {prGenerated && <TabsTrigger value="press-release"><Newspaper className="mr-2 h-4 w-4" />Press Release</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="rating-note">
                    <Card>
                        <CardHeader><CardTitle>Approved Rating Note</CardTitle></CardHeader>
                        <CardContent>
                             <RatingNoteEditor key="rn" ref={rnEditorRef} isReadOnly={true} content={note.editorContent} />
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="press-release">
                     <Card>
                        <CardHeader><CardTitle>Press Release (PR)</CardTitle></CardHeader>
                        <CardContent>
                            <RatingNoteEditor key="pr" ref={prEditorRef} isReadOnly={false} content={prContent} />
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
    );
}
