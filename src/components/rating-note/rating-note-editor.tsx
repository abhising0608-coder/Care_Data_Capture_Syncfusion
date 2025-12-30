
'use client';
import { useEffect } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';

// Register your Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cWWJCe0x3Q3xbf1x0ZFNMyV5bQXVPMyBoS35RdURhW35ednBRR2BeWUJ1');

DocumentEditorContainerComponent.Inject(Toolbar);

export function RatingNoteEditor() {
    let container: DocumentEditorContainerComponent | null;

    useEffect(() => {
        // This is a workaround to ensure the editor resizes correctly within a flex container.
        const timer = setTimeout(() => {
            if (container) {
                container.resize();
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [container]);

  return (
    <div className="h-full w-full">
         <style>
              {`
                  @import url('https://cdn.syncfusion.com/ej2/material.css');
              `}
          </style>
        <DocumentEditorContainerComponent
            ref={(scope) => { container = scope; }}
            height="calc(100vh - 180px)"
            enableToolbar={true}
            serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        />
    </div>
  );
}

