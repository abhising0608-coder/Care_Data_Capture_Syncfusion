
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
import { PressReleasePreparation } from '@/components/rating-note/press-release-preparation';
import { PressReleaseFinalForm } from '@/components/rating-note/press-release-final-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PressReleasePreview } from '@/components/rating-note/press-release-preview';
import { PressReleasePublication } from '@/components/rating-note/press-release-publication';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PressReleasePage() {
    const params = useParams();
    const router = useRouter();
    const ratingCycleId = params.ratingCycleId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [view, setView] = useState<'initiation' | 'preparation' | 'editor' | 'preview'>('initiation');
    const [preparationData, setPreparationData] = useState<any>(null);
    const [finalFormData, setFinalFormData] = useState<any>(null);

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      ratingCycleId ? `/api/notes/${ratingCycleId}` : null,
      fetcher
    );
    
    const handlePrepare = () => {
        setView('preparation');
        toast({ title: 'Configure Press Release', description: 'Please select the appropriate options to continue.' });
    };

    const handlePreparationSubmit = (prepData: any) => {
        setPreparationData(prepData);
        setView('editor');
        toast({ title: 'Success', description: 'Press Release editor is now ready.' });
    };

    const handleEditorSubmit = (formData: any) => {
        setFinalFormData(formData);
        setView('preview');
        toast({ title: 'Preview Ready', description: 'The Press Release preview has been generated.' });
    };
    
    const handleFinalSubmit = async () => {
        if (!note || !user || !finalFormData) {
            toast({ variant: 'destructive', title: 'Error', description: 'Ensure all documents are generated and ready.' });
            return;
        }

        try {
            const res = await fetch(`/api/notes/${ratingCycleId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'submit-pr',
                    actorId: user.uid,
                    prContent: JSON.stringify(finalFormData),
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
    
    const renderContent = () => {
        switch (view) {
            case 'initiation':
                return <PressReleaseInitiation note={note} onPrepare={handlePrepare} />;
            case 'preparation':
                return <PressReleasePreparation note={note} onSubmit={handlePreparationSubmit} onCancel={() => setView('initiation')} />;
            case 'editor':
                 return <PressReleaseFinalForm note={note} onSubmit={handleEditorSubmit} onCancel={() => setView('preparation')} />;
            case 'preview':
                return <PressReleasePreview note={note} onEdit={() => setView('editor')} onClose={() => setView('initiation')} onSubmit={handleFinalSubmit} />;
            default:
                 return <PressReleaseInitiation note={note} onPrepare={handlePrepare} />;
        }
    };

    return (
        <div className="space-y-6">
             <header>
                 <h1 className="text-2xl font-semibold text-foreground">
                    Press Release: {note.companyName}
                </h1>
            </header>

            <Tabs defaultValue="preparation">
                <TabsList>
                    <TabsTrigger value="preparation">Preparation of Press Release</TabsTrigger>
                    <TabsTrigger value="publication">Press Release Publication</TabsTrigger>
                    <TabsTrigger value="history">PR History</TabsTrigger>
                </TabsList>
                <TabsContent value="preparation">
                    {renderContent()}
                </TabsContent>
                 <TabsContent value="publication">
                    <PressReleasePublication note={note} />
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
