
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
import { ChevronDown, Send, Edit, XCircle, Download } from 'lucide-react';
import { useState } from 'react';
import { SendToQCModal } from './send-to-qc-modal';
import { useToast } from '@/hooks/use-toast';

type Action = 'send-to-gh' | 'send-to-rh' | 'send-to-qc' | 'send-to-auditor' | 'send-to-editor' | 'send-to-client';

interface PressReleasePreviewProps {
  note: RatingNote;
  onAction: (action: Action, payload?: any) => void;
  isReadOnly?: boolean;
}

const getNextActions = (status: NoteStatus): Action[] => {
    switch (status) {
        case 'PR Generation Pending':
        case 'Draft':
             return ['send-to-gh'];
        case 'GH Approved':
            return ['send-to-rh'];
        case 'RH Approved':
            return ['send-to-qc'];
        case 'QC Approved':
            return ['send-to-auditor', 'send-to-client'];
        case 'Auditor Approved':
             return ['send-to-editor', 'send-to-client'];
        case 'Editor Approved':
            return ['send-to-client'];
        default:
            return [];
    }
};

const actionDisplayNames: Record<Action, string> = {
    'send-to-gh': 'Send to GH',
    'send-to-rh': 'Send to RH',
    'send-to-qc': 'Send to QC',
    'send-to-auditor': 'Send to Auditor',
    'send-to-editor': 'Send to Editor',
    'send-to-client': 'Send to Client',
};


export function PressReleasePreview({ note, onAction, isReadOnly = false }: PressReleasePreviewProps) {
  const { toast } = useToast();
  const nextActions = getNextActions(note.status);

  return (
    <>
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
          <div className="flex items-center gap-2">
              {nextActions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Send to <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {nextActions.map(action => (
                            <DropdownMenuItem key={action} onClick={() => onAction(action)}>
                                {actionDisplayNames[action]}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
              )}

              {!isReadOnly && (
                <Button variant="outline" onClick={() => onAction('edit-pr' as any)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Press Release
                </Button>
              )}
              <Button variant="outline" onClick={() => alert("Placeholder for PDF Download")}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
          </div>
        </header>
        
        <Card className="h-[calc(100vh-350px)]">
          <CardHeader>
            <CardTitle>PR Document Preview</CardTitle>
            <CardDescription>This is a placeholder for the generated PDF content.</CardDescription>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                  <p className="text-2xl">PDF preview</p>
              </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
