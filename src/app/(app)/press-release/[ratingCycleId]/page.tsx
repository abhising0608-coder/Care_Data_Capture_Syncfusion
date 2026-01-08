
'use client';

import { Suspense, useState } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import type { RatingNote, Role } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PressReleaseFinalForm } from '@/components/rating-note/press-release-final-form';
import { PressReleasePreview } from '@/components/rating-note/press-release-preview';
import { PressReleasePublication } from '@/components/rating-note/press-release-publication';
import { PressReleaseHistory } from '@/components/rating-note/press-release-history';
import { PressReleaseReview } from '@/components/rating-note/press-release-review';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const isReviewer = (role?: Role) => role && ['GROUP_HEAD', 'RATING_HEAD_SD', 'QC', 'AUDITOR', 'EDITOR'].includes(role);

export default function PressReleasePage() {
    const params = useParams();
    const router = useRouter();
    const ratingCycleId = params.ratingCycleId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [view, setView] = useState<'edit' | 'preview'>('edit');

    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      ratingCycleId ? `/api/notes/${ratingCycleId}` : null,
      fetcher
    );

    const handleAction = async (action: string, payload?: Record<string, any>) => {
        if (!note || !user) return;
        
        const isPreviewAction = action === 'preview';

        if (isPreviewAction) {
             await handleAction('save-pr-draft', payload);
             setView('preview');
             return;
        }

        try {
            const res = await fetch(`/api/notes/${ratingCycleId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action, 
                    actorId: user.uid,
                    ...payload
                }),
            });

            if (!res.ok) throw new Error(`Failed to perform action: ${action}`);

            toast({ title: 'Success', description: 'Press Release has been updated.' });
            mutate();

            if (['submit-to-gh', 'submit-to-rh', 'submit-to-qc'].includes(action)) {
                router.push('/dashboard');
            }

        } catch (error) {
            console.error(`Action failed: ${action}`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        }
    };
    

    if (isLoading || !note || !user) {
        return (
             <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-8 space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[calc(100vh-250px)] w-full" />
            </div>
        )
    }
    
    const renderContent = () => {
        const isCurrentUserReviewer = isReviewer(user.role);
        const isNoteUnderReviewByCurrentUser = isCurrentUserReviewer && note.status.includes('In Review') && note.currentActor === user.role;

        if (isNoteUnderReviewByCurrentUser) {
            return <PressReleaseReview note={note} onAction={handleAction} />;
        }
        
        if (user.role === 'RATING_ANALYST') {
            if (view === 'edit') {
                 return (
                    <PressReleaseFinalForm 
                        key={`${note.id}-edit`}
                        note={note} 
                        onAction={handleAction} 
                    />
                );
            }
             if (view === 'preview') {
                return (
                    <PressReleasePreview 
                        key={`${note.id}-preview`}
                        note={note} 
                        onAction={handleAction}
                        onEdit={() => setView('edit')}
                    />
                );
            }
        }

        return <PressReleaseReview note={note} onAction={handleAction} isReadOnly={true} />;
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
                     <PressReleaseHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}
