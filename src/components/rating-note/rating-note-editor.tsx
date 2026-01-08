
'use client';
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
    DocumentEditorContainer as DocumentEditorContainerComponent,
    Toolbar,
    SfdtExport,
    WordExport,
} from '@syncfusion/ej2-react-documenteditor';

DocumentEditorContainerComponent.Inject(Toolbar, SfdtExport, WordExport);

interface RatingNoteEditorProps {
    isReadOnly?: boolean;
    content?: string;
}

const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
};

export const RatingNoteEditor = forwardRef<DocumentEditorContainerComponent | null, RatingNoteEditorProps>(
    ({ isReadOnly = false, content }, ref) => {
        const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
        const isClient = useIsClient();

        useImperativeHandle(ref, () => editorRef.current, []);

        useEffect(() => {
            let editorInstance: DocumentEditorContainerComponent | null = null;
            
            if (isClient) {
                const container = document.getElementById('editor-container');
                if (container && container.childElementCount === 0) {
                    editorInstance = new DocumentEditorContainerComponent({
                        height: 'calc(100vh - 180px)',
                        enableToolbar: true,
                        isReadOnly: isReadOnly,
                        showPropertiesPane: false,
                        serviceUrl: 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/',
                    });
                    editorInstance.appendTo(container);
                    editorRef.current = editorInstance;

                    if (editorInstance.documentEditor) {
                        try {
                            if (content && content.length > 50) {
                                JSON.parse(content);
                                editorInstance.documentEditor.open(content);
                            } else {
                                const defaultContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" });
                                editorInstance.documentEditor.open(defaultContent);
                            }
                        } catch (e) {
                            console.error("Invalid SFDT content provided:", e);
                            const errorContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document. The content provided was invalid.\"}]}]}]}" });
                            editorInstance.documentEditor.open(errorContent);
                        }
                        
                        editorInstance.documentEditor.showTrackChanges = true;
                    }
                }
            }

            return () => {
                // Cleanup: destroy the component instance when the component unmounts
                if (editorInstance) {
                    editorInstance.destroy();
                    editorInstance = null;
                }
            };
        }, [isClient, content, isReadOnly]); 


        if (!isClient) {
            return null; 
        }

        return (
            <div className="h-full w-full">
                 <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                <div id="editor-container"></div>
            </div>
        );
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
