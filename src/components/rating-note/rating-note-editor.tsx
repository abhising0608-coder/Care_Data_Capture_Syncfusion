
'use client';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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

        // This allows parent components to call methods on the editor instance
        useImperativeHandle(ref, () => editorRef.current, []);

        // The 'created' prop is the correct lifecycle hook from Syncfusion to initialize the editor.
        // This runs once after the component has been mounted and is ready.
        const onCreated = (): void => {
            const editorInstance = editorRef.current;
            if (editorInstance && editorInstance.documentEditor) {
                // Configure the editor properties
                editorInstance.documentEditor.isReadOnly = isReadOnly || false;
                editorInstance.documentEditor.showTrackChanges = true;

                if (content) {
                    try {
                        // Ensure content is valid JSON before attempting to open
                        JSON.parse(content);
                        editorInstance.documentEditor.open(content);
                    } catch (e) {
                        console.error("Invalid SFDT content provided:", e);
                        // Load a safe, default error message into the editor
                        const errorContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document. The content provided was invalid.\"}]}]}]}" });
                        editorInstance.documentEditor.open(errorContent);
                    }
                } else {
                    // Load a default placeholder if no content is provided
                    const defaultContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" });
                    editorInstance.documentEditor.open(defaultContent);
                }

                // Enable track changes after a short delay to ensure the document is fully loaded
                setTimeout(() => {
                    if (editorInstance && editorInstance.documentEditor) {
                        editorInstance.documentEditor.trackChanges = true;
                    }
                }, 500);

                // Ensure the editor fits its container
                editorInstance.resize();
            }
        };

        // The `beforeDestroy` prop is the correct cleanup function.
        // It's called by the Syncfusion component itself when it's about to be unmounted.
        const onBeforeDestroy = (): void => {
            // This is the official Syncfusion method to clean up the component instance, preventing memory leaks.
            if (editorRef.current) {
                editorRef.current.destroy();
            }
        };

        return (
            <div className="h-full w-full">
                <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                <DocumentEditorContainerComponent
                    ref={editorRef}
                    height="calc(100vh - 180px)"
                    enableToolbar={true}
                    created={onCreated}
                    beforeDestroy={onBeforeDestroy}
                    serviceUrl='https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/'
                />
            </div>
        );
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
