
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RatingNote } from '@/lib/definitions';
import { ChevronDown, Send, Edit, XCircle, Download } from 'lucide-react';

interface PressReleasePreviewProps {
  note: RatingNote;
  onEdit: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function PressReleasePreview({ note, onEdit, onClose, onSubmit }: PressReleasePreviewProps) {

  // Placeholder logic for approvals. In a real app, this would come from the note's status history.
  const isGhApproved = true; 
  const isQcApproved = true;

  return (
    <div className="space-y-4 mt-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {note.companyName}
          </h2>
          <p className="text-muted-foreground text-sm">Press Release</p>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Send to <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => alert("Action: Send to GH")}>Send to GH</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Action: Send to RH")}>Send to RH</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Action: Send to QC")}>Send to QC</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => alert("Action: Send to Auditor")}>Send to Auditor</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Action: Send to Editor")}>Send to Editor</DropdownMenuItem>
                     <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => alert("Action: Send to Client")} disabled={!isGhApproved || !isQcApproved}>
                        Send to Client
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit Press Release
            </Button>
             <Button variant="outline" onClick={() => alert("Placeholder for PDF Download")}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button variant="outline" onClick={onClose}>
                <XCircle className="mr-2 h-4 w-4" /> Close & Go back to Initiation
            </Button>
        </div>
      </header>
      
      <Card className="h-[calc(100vh-350px)]">
        <CardContent className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                 <p className="text-2xl">PDF preview</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
