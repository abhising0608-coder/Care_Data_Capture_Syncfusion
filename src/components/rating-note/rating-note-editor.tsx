
'use client';
import { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';

// Toolbar module is injected to handle toolbar actions
DocumentEditorContainerComponent.Inject(Toolbar);

interface RatingNoteEditorProps {
    isReadOnly?: boolean;
    content?: string; // SFDT JSON string
}

export const RatingNoteEditor = forwardRef<DocumentEditorContainerComponent | null, RatingNoteEditorProps>(
    ({ isReadOnly = false, content }, ref) => {
    
    const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
    useImperativeHandle(ref, () => editorRef.current, []);

    useEffect(() => {
        const editorInstance = editorRef.current;
        let timer: NodeJS.Timeout;

        if (editorInstance) {
            timer = setTimeout(() => {
                if (editorInstance && editorInstance.documentEditor) {
                    editorInstance.resize();
                    
                    editorInstance.documentEditor.isReadOnly = isReadOnly;
                    editorInstance.documentEditor.showTrackChanges = true;
                    
                    if (content) {
                       try {
                            JSON.parse(content);
                            editorInstance.documentEditor.open(content);
                       } catch (e) {
                           console.error("Invalid SFDT content provided:", e);
                           editorInstance.documentEditor.open(JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load document.\"}]}]}]}" }));
                       }
                    } else {
                        editorInstance.documentEditor.open(JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" }));
                    }

                    setTimeout(() => {
                        if (editorInstance && editorInstance.documentEditor) {
                             editorInstance.documentEditor.trackChanges = true;
                        }
                    }, 500);

                }
            }, 200);
        }

        // --- ROBUST CLEANUP ---
        // This is the critical fix. It ensures the component is properly destroyed
        // when the component unmounts (e.g., when navigating away from the page).
        return () => {
             if (timer) {
                clearTimeout(timer);
             }
             if (editorRef.current) {
                // The destroy method is crucial for preventing memory leaks and runtime errors on unmount.
                editorRef.current.destroy();
                // Setting the ref to null helps prevent any lingering async operations
                // from trying to access the destroyed instance.
                editorRef.current = null;
             }
        };
    // Ensure the effect re-runs if the content or read-only state changes.
    }, [isReadOnly, content]);

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
});

RatingNoteEditor.displayName = 'RatingNoteEditor';
