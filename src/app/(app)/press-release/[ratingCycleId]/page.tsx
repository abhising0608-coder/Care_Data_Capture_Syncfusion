
'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Send, Newspaper, FileText } from 'lucide-react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingNoteEditor } from '@/components/rating-note/rating-note-editor';
import type { RatingNote, Role } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PressReleaseInitiation } from '@/components/rating-note/press-release-initiation';
import { PressReleasePreparation } from '@/components/rating-note/press-release-preparation';
import { PressReleaseFinalForm } from '@/components/rating-note/press-release-final-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PressReleasePreview } from '@/components/rating-note/press-release-preview';
import { PressReleasePublication } from '@/components/rating-note/press-release-publication';
import { PressReleaseHistory } from '@/components/rating-note/press-release-history';
import { PressReleaseReview } from '@/components/rating-note/press-release-review';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Helper function to check if the user is a reviewer
const isReviewer = (role: Role) => ['GROUP_HEAD', 'RATING_HEAD_SD', 'QC', 'AUDITOR', 'EDITOR'].includes(role);


export default function PressReleasePage() {
    const params = useParams();
    const router = useRouter();
    const ratingCycleId = params.ratingCycleId as string;
    const { toast } = useToast();
    const { user } = useAuth();
    
    // The main data fetching for the rating note
    const { data: note, isLoading, mutate } = useSWR<RatingNote>(
      ratingCycleId ? `/api/notes/${ratingCycleId}` : null,
      fetcher
    );

    // This handles all state transitions by calling the backend
    const handleAction = async (action: string, payload?: Record<string, any>) => {
        if (!note || !user) return;

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
            mutate(); // Re-fetch the data to get the new status
            
            // If the action moves the note away from the current user, redirect
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
    
    // Determine what to render based on the user's role and the note's status
    const renderContent = () => {
        const isCurrentUserReviewer = isReviewer(user.role);
        const isNoteUnderReviewByCurrentUser = isCurrentUserReviewer && note.status.includes('In Review') && note.currentActor === user.role;

        if (isNoteUnderReviewByCurrentUser) {
            // Reviewers see a read-only view with Approve/Rework buttons
            return <PressReleaseReview note={note} onAction={handleAction} />;
        }
        
        // The RA (owner) sees the editor form
        if (user.role === 'RATING_ANALYST') {
            return (
                <PressReleaseFinalForm 
                    key={note.id + note.status} 
                    note={note} 
                    onAction={handleAction} 
                />
            );
        }

        // Fallback for other roles or states (e.g., read-only view for uninvolved parties)
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
