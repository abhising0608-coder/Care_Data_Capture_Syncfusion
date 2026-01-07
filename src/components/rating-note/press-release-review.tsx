
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RatingNote, NoteStatus } from '@/lib/definitions';
import { ChevronDown, Send, Edit, XCircle, Download, Check, MessageSquareWarning } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface PressReleaseReviewProps {
  note: RatingNote;
  onAction: (action: string, payload?: any) => void;
  isReadOnly?: boolean;
}


export function PressReleaseReview({ note, onAction, isReadOnly = false }: PressReleaseReviewProps) {
    
    const roleAction = note.status.split(' ')[2]?.replace(/[()]/g, '').toLowerCase();
    const approveAction = `approve-${roleAction}`;
    const reworkAction = `rework-${roleAction}`;

    return (
        <div className="space-y-4 mt-4">
            <header className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold text-foreground">
                {note.companyName}
                </h2>
                <p className="text-muted-foreground text-sm">
                    Press Release - Status: <span className="font-medium text-primary">{note.status}</span>
                </p>
            </div>
            {!isReadOnly && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => onAction(reworkAction, { comments: 'Rework needed' })}>
                        <MessageSquareWarning className="mr-2 h-4 w-4" /> Request Rework
                    </Button>
                     <Button onClick={() => onAction(approveAction)}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </div>
            )}
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>PR Document Preview</CardTitle>
                    <CardDescription>This is a placeholder for the generated PDF content of the Press Release.</CardDescription>
                </CardHeader>
                <CardContent className="h-full flex items-center justify-center bg-gray-100 min-h-[500px]">
                    <div className="text-center text-muted-foreground">
                        <p className="text-2xl">PDF preview</p>
                    </div>
                </CardContent>
            </Card>

            {!isReadOnly && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Comments</CardTitle>
                        <CardDescription>Add your review comments here. These will be sent back to the Rating Analyst if you request rework.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea placeholder="Type your comments..." className="min-h-[150px]" />
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
