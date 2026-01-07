
'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Send, Newspaper, FileText } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PressReleaseInitiation } from '@/components/rating-note/press-release-initiation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Default empty content for new documents
const newDocContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting here...\"}]}]}]}" });

export default function FinalDocumentsPage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.noteId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    const prEditorRef = useRef<DocumentEditorContainer | null>(null);

    const [view, setView] = useState<'initiation' | 'editor'>('initiation');
    const [prContent, setPrContent] = useState<string | undefined>(undefined);

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      noteId ? `/api/notes/${noteId}` : null,
      fetcher,
      {
          onSuccess: (data) => {
              if (data.prContent) {
                  setPrContent(data.prContent);
              }
          }
      }
    );
    
    const handlePrepare = () => {
        setPrContent(note?.prContent || newDocContent);
        setView('editor');
        toast({ title: 'Success', description: 'Press Release editor is now ready.' });
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
             <header>
                 <h1 className="text-2xl font-semibold text-foreground">
                    {note.companyName}
                </h1>
            </header>

            <Tabs defaultValue="preparation">
                <TabsList>
                    <TabsTrigger value="preparation">Preparation of Press Release</TabsTrigger>
                    <TabsTrigger value="publication">Press Release Publication</TabsTrigger>
                    <TabsTrigger value="history">PR History</TabsTrigger>
                </TabsList>
                <TabsContent value="preparation">
                    {view === 'initiation' ? (
                        <PressReleaseInitiation note={note} onPrepare={handlePrepare} />
                    ) : (
                        <div className="space-y-6 mt-4">
                            <div className="flex justify-end">
                                <Button onClick={handleFinalSubmit}>
                                    <Send className="mr-2 h-4 w-4" /> Submit PR
                                </Button>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Press Release (PR)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RatingNoteEditor key="pr" ref={prEditorRef} isReadOnly={false} content={prContent} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
                 <TabsContent value="publication">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Press Release Publication</CardTitle></CardHeader>
                        <CardContent><p>Placeholder for Press Release Publication content.</p></CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="history">
                     <Card className="mt-4">
                        <CardHeader><CardTitle>PR History</CardTitle></CardHeader>
                        <CardContent><p>Placeholder for PR History content.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
