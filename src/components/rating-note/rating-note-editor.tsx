
'use client';
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
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

        // The parent component can still interact with the editor via the ref
        useImperativeHandle(ref, () => editorRef.current, []);

        useEffect(() => {
            const editorInstance = editorRef.current;
            
            // This timeout ensures that the React component has fully mounted and the DOM
            // is stable before we initialize the imperative Syncfusion widget. This prevents
            // race conditions that can lead to improper cleanup on unmount.
            const timer = setTimeout(() => {
                if (editorInstance && editorInstance.documentEditor) {
                    editorInstance.resize();
                    editorInstance.documentEditor.isReadOnly = isReadOnly || false;
                    editorInstance.documentEditor.showTrackChanges = true;

                    if (content) {
                        try {
                            JSON.parse(content);
                            editorInstance.documentEditor.open(content);
                        } catch (e) {
                            console.error("Invalid SFDT content provided:", e);
                            // Load an error message into the editor if content is invalid
                            editorInstance.documentEditor.open(JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document.\"}]}]}]}" }));
                        }
                    } else {
                         // Load a default placeholder if no content is provided
                        editorInstance.documentEditor.open(JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" }));
                    }

                    // Enable track changes after a short delay to ensure the document is fully loaded
                    setTimeout(() => {
                        if (editorInstance && editorInstance.documentEditor) {
                             editorInstance.documentEditor.trackChanges = true;
                        }
                    }, 500);
                }
            }, 100); // A small delay is sufficient

            // The cleanup function - this is the critical fix.
            return () => {
                clearTimeout(timer);
                if (editorRef.current) {
                    // destroy() is the official Syncfusion method to clean up the component instance.
                    // This prevents memory leaks and errors on page navigation.
                    editorRef.current.destroy();
                }
            };
        }, [content, isReadOnly]); // Rerun effect if content or read-only status changes.

        return (
            <div className="h-full w-full">
                <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                <DocumentEditorContainerComponent
                    ref={editorRef}
                    height="calc(100vh - 180px)"
                    enableToolbar={true}
                    serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                />
            </div>
        );
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
