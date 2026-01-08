
'use client';
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
    DocumentEditorContainer as DocumentEditorContainerComponent,
    Toolbar,
    SfdtExport,
    WordExport,
    DocumentEditorContainer,
} from '@syncfusion/ej2-react-documenteditor';

// Inject the required modules for toolbar, SFDT, and DOCX export functionality.
DocumentEditorContainerComponent.Inject(Toolbar, SfdtExport, WordExport);

interface RatingNoteEditorProps {
    isReadOnly?: boolean;
    content?: string; // SFDT JSON string
}

// A simple hook to prevent server-side rendering of a component
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
};

export const RatingNoteEditor = forwardRef<DocumentEditorContainer | null, RatingNoteEditorProps>(
    ({ isReadOnly = false, content }, ref) => {
        const editorRef = useRef<DocumentEditorContainerComponent>(null);
        const isClient = useIsClient();

        // Expose the editor instance to the parent component via the ref
        useImperativeHandle(ref, () => editorRef.current?.container, []);

        // Render a placeholder or null on the server
        if (!isClient || !content) {
            return null;
        }

        // The key prop is crucial. It forces React to create a new component instance
        // whenever the content changes, ensuring it re-initializes correctly.
        return (
            <div className="h-full w-full">
                <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                <DocumentEditorContainerComponent
                    key={content} // Force re-mount on content change
                    ref={editorRef}
                    height={'calc(100vh - 180px)'}
                    enableToolbar={true}
                    isReadOnly={isReadOnly}
                    showPropertiesPane={false} // Disable the properties pane
                    serviceUrl='https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/'
                    created={() => {
                        if (editorRef.current) {
                            // Ensure track changes is enabled after creation
                            editorRef.current.documentEditor.showTrackChanges = true;
                            
                            // Safely open the document
                            try {
                                if (content && content.length > 50) {
                                    // Verify it's valid JSON before opening
                                    JSON.parse(content);
                                    editorRef.current.documentEditor.open(content);
                                } else {
                                    // Provide a default document if content is missing
                                    const defaultContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" });
                                    editorRef.current.documentEditor.open(defaultContent);
                                }
                            } catch (e) {
                                console.error("Invalid SFDT content provided:", e);
                                const errorContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document. The content provided was invalid.\"}]}]}]}" });
                                editorRef.current.documentEditor.open(errorContent);
                            }
                        }
                    }}
                />
            </div>
        );
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
