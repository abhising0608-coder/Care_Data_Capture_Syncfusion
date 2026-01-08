
'use client';
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
    DocumentEditorContainerComponent,
    Toolbar,
    SfdtExport,
    WordExport,
} from '@syncfusion/ej2-react-documenteditor';

// Inject the required modules for toolbar, SFDT, and DOCX export functionality.
DocumentEditorContainerComponent.Inject(Toolbar, SfdtExport, WordExport);

interface RatingNoteEditorProps {
    isReadOnly?: boolean;
    content?: string; // SFDT JSON string
}

export const RatingNoteEditor = forwardRef<DocumentEditorContainerComponent | null, RatingNoteEditorProps>(
    ({ isReadOnly, content }, ref) => {
        const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
        const [isMounted, setIsMounted] = useState(false);

        // This allows parent components to call methods on the editor instance
        useImperativeHandle(ref, () => editorRef.current, []);

        useEffect(() => {
            // This effect runs only once on the client-side after the initial render.
            setIsMounted(true);
            
            // Cleanup function to destroy the component instance on unmount
            return () => {
                if (editorRef.current) {
                    editorRef.current.destroy();
                }
            };
        }, []);


        // The 'created' prop is the correct lifecycle hook from Syncfusion to initialize the editor.
        const onCreated = (): void => {
            const editorInstance = editorRef.current;
            if (editorInstance && editorInstance.documentEditor) {
                editorInstance.documentEditor.isReadOnly = isReadOnly || false;
                editorInstance.showPropertiesPane = false; // Hide properties pane by default
                editorInstance.documentEditor.showTrackChanges = true;

                if (content) {
                    try {
                        // Ensure content is valid JSON before attempting to open
                        JSON.parse(content);
                        editorInstance.documentEditor.open(content);
                    } catch (e) {
                        console.error("Invalid SFDT content provided:", e);
                        const errorContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document. The content provided was invalid.\"}]}]}]}" });
                        editorInstance.documentEditor.open(errorContent);
                    }
                } else {
                    const defaultContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" });
                    editorInstance.documentEditor.open(defaultContent);
                }
            }
        };
        
        return (
            <div className="h-full w-full">
                <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                {/* Conditionally render the component only after the component has mounted */}
                {isMounted && (
                     <DocumentEditorContainerComponent
                        ref={editorRef}
                        height="calc(100vh - 180px)"
                        enableToolbar={true}
                        created={onCreated}
                        serviceUrl='https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/'
                    />
                )}
            </div>
        );
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
