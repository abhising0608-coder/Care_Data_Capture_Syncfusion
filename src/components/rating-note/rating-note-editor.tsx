
'use client';
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
    DocumentEditorContainer,
    Toolbar,
    SfdtExport,
    WordExport,
} from '@syncfusion/ej2-documenteditor';

// Inject the required modules for toolbar, SFDT, and DOCX export functionality.
DocumentEditorContainer.Inject(Toolbar, SfdtExport, WordExport);

interface RatingNoteEditorProps {
    isReadOnly?: boolean;
    content?: string; // SFDT JSON string
}

export const RatingNoteEditor = forwardRef<DocumentEditorContainer | null, RatingNoteEditorProps>(
    ({ isReadOnly = false, content }, ref) => {
        const editorContainerRef = useRef<HTMLDivElement>(null);
        const editorInstanceRef = useRef<DocumentEditorContainer | null>(null);

        // This allows parent components to call methods on the editor instance
        useImperativeHandle(ref, () => editorInstanceRef.current, []);

        useEffect(() => {
            // This effect runs only once on the client-side after the component mounts
            let editor: DocumentEditorContainer | undefined;
            
            if (editorContainerRef.current && !editorInstanceRef.current) {
                // Create a new instance of the editor
                editor = new DocumentEditorContainer({
                    enableToolbar: true,
                    isReadOnly: isReadOnly,
                    showPropertiesPane: false,
                    height: 'calc(100vh - 180px)',
                    serviceUrl: 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/'
                });
                
                // Set the current instance
                editorInstanceRef.current = editor;

                // Append the editor to the container div
                editor.appendTo(editorContainerRef.current);
                
                // Initialize the document editor after it's appended
                if (editor.documentEditor) {
                     editor.documentEditor.showTrackChanges = true;

                    try {
                        if (content && content.length > 50) {
                            // Ensure content is valid JSON before attempting to open
                            JSON.parse(content);
                            editor.documentEditor.open(content);
                        } else {
                             const defaultContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" });
                             editor.documentEditor.open(defaultContent);
                        }
                    } catch (e) {
                         console.error("Invalid SFDT content provided:", e);
                         const errorContent = JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document. The content provided was invalid.\"}]}]}]}" });
                         editor.documentEditor.open(errorContent);
                    }
                }
            }

            // Cleanup function to destroy the component instance on unmount
            return () => {
                if (editorInstanceRef.current) {
                    editorInstanceRef.current.destroy();
                    editorInstanceRef.current = null;
                }
            };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []); // Empty dependency array ensures this runs only once.

        return (
            <div className="h-full w-full">
                <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                {/* This div is the stable host for the imperative component */}
                <div ref={editorContainerRef}></div>
            </div>
        );
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
