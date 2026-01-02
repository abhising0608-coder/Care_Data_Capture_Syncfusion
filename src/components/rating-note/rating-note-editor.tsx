
'use client';
import { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';

// Register your Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cWWJCe0x3Q3xbf1x0ZFNMyV5bQXVPMyBoS35RdURhW35ednBRR2BeWUJ1');

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

        const timer = setTimeout(() => {
            if (editorInstance) {
                editorInstance.resize();
                
                // Set read-only state
                editorInstance.documentEditor.isReadOnly = isReadOnly;
                
                // Enable track changes
                editorInstance.documentEditor.showTrackChanges = true;
                
                if (content) {
                    editorInstance.documentEditor.open(content);
                } else {
                    // Load a default template or empty document if no content is provided
                    editorInstance.documentEditor.open(JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Start drafting the rating note here...\"}]}]}]}" }));
                }

                // Programmatically turn on track changes
                setTimeout(() => {
                    if (editorInstance) {
                         editorInstance.documentEditor.trackChanges = true;
                    }
                }, 500); // Delay to ensure editor is fully initialized

            }
        }, 200);

        return () => {
             clearTimeout(timer);
             if (editorInstance) {
                // The destroy method is crucial for preventing memory leaks and runtime errors on unmount.
                editorInstance.destroy();
             }
        };
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
