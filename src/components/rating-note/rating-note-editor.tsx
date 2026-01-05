
'use client';
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
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

// This is the definitive fix. We are wrapping the component in a class-based
// structure internally to gain access to `componentWillUnmount`. This lifecycle
// method is synchronous and guaranteed to execute *before* the DOM is torn down,
// which is essential for complex, stateful components like Syncfusion's editor.
// This prevents the race condition where `destroy()` is called after the UI is gone.

class Editor extends React.Component<RatingNoteEditorProps & { editorRef: React.RefObject<DocumentEditorContainerComponent> }> {
    
    componentDidMount() {
        this.initializeEditor();
    }
    
    componentDidUpdate(prevProps: RatingNoteEditorProps) {
        if (this.props.content !== prevProps.content || this.props.isReadOnly !== prevProps.isReadOnly) {
            this.initializeEditor();
        }
    }

    componentWillUnmount() {
        // This is the critical fix. This method runs synchronously before the
        // component is removed from the DOM.
        if (this.props.editorRef.current) {
            this.props.editorRef.current.destroy();
        }
    }

    initializeEditor() {
        const editorInstance = this.props.editorRef.current;
        if (editorInstance && editorInstance.documentEditor) {
            editorInstance.resize();
            editorInstance.documentEditor.isReadOnly = this.props.isReadOnly || false;
            editorInstance.documentEditor.showTrackChanges = true;

            if (this.props.content) {
                try {
                    JSON.parse(this.props.content);
                    editorInstance.documentEditor.open(this.props.content);
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
    }

    render() {
        return (
            <div className="h-full w-full">
                <style>
                    {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
                </style>
                <DocumentEditorContainerComponent
                    ref={this.props.editorRef}
                    height="calc(100vh - 180px)"
                    enableToolbar={true}
                    serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                />
            </div>
        );
    }
}


export const RatingNoteEditor = forwardRef<DocumentEditorContainerComponent | null, RatingNoteEditorProps>(
    (props, ref) => {
        const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
        
        // The parent component can still interact with the editor via the ref
        useImperativeHandle(ref, () => editorRef.current, []);

        return <Editor {...props} editorRef={editorRef} />;
    }
);

RatingNoteEditor.displayName = 'RatingNoteEditor';
