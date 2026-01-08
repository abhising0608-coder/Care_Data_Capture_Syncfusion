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
import { ChevronDown, Send, Edit, Download, Loader2 } from 'lucide-react';
import { RatingNoteEditor } from './rating-note-editor';
import { useEffect, useRef, useState } from 'react';
import type { DocumentEditorContainer } from '@syncfusion/ej2-documenteditor';
import { getDecompressedSfdt, bindPlaceholders } from '@/lib/rating-note-service';
import * as prTemplate from '@/lib/press-release-template.json';


type Action = 'send-to-gh' | 'send-to-rh' | 'send-to-qc' | 'send-to-auditor' | 'send-to-editor' | 'send-to-client';

interface PressReleasePreviewProps {
  note: RatingNote;
  onAction: (action: Action | 'edit-pr', payload?: any) => void;
  onEdit: () => void;
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


export function PressReleasePreview({ note, onAction, onEdit, isReadOnly = false }: PressReleasePreviewProps) {
  const nextActions = getNextActions(note.status);
  const editorRef = useRef<DocumentEditorContainer | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
        setIsLoadingContent(true);
        try {
            const templateString = await getDecompressedSfdt(prTemplate);
            const prData = note.prContent ? JSON.parse(note.prContent) : {};
            const boundSfdt = bindPlaceholders(templateString, prData);
            setDocumentContent(boundSfdt);
        } catch (error) {
            console.error("Failed to load PR content:", error);
            // Set a fallback error document
            const errorSfdt = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load press release preview.\"}]}]}]}" });
            setDocumentContent(errorSfdt);
        } finally {
            setIsLoadingContent(false);
        }
    };
    loadContent();
  }, [note.prContent]);

  const handleExport = (format: 'Docx' | 'Pdf') => {
      if (editorRef.current) {
          const fileName = `${note.companyName}_PressRelease_Preview`;
          editorRef.current.documentEditor.save(fileName, format);
      }
  }

  return (
    <>
      <div className="space-y-4 mt-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {note.companyName}
            </h2>
            <p className="text-muted-foreground text-sm">
                Press Release Preview - Status: <span className="font-medium text-primary">{note.status}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
              {nextActions.length > 0 && !isReadOnly && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
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
                <Button variant="outline" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" /> Back to Edit
                </Button>
              )}
              <Button variant="outline" onClick={() => handleExport('Pdf')}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
          </div>
        </header>
        
        <div className="h-[calc(100vh-350px)] border rounded-lg">
            {isLoadingContent || !documentContent ? (
                 <div className="flex items-center justify-center flex-col h-full w-full bg-muted/50 rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-foreground">Generating Preview...</p>
                </div>
            ) : (
                <RatingNoteEditor
                    ref={editorRef}
                    isReadOnly={true}
                    content={documentContent}
                />
            )}
        </div>
      </div>
    </>
  );
}