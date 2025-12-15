'use client';
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  RangesDirective,
  RangeDirective,
  ColumnsDirective,
  ColumnDirective,
  RowsDirective,
  RowDirective,
  CellsDirective,
  CellDirective,
} from '@syncfusion/ej2-react-spreadsheet';
import { useEffect, useRef } from 'react';

// Make sure to have the correct CSS import in a global styles file or layout.
// import '@syncfusion/ej2-base/styles/material.css';
// import '@syncfusion/ej2-buttons/styles/material.css';
// import '@syncfusion/ej2-dropdowns/styles/material.css';
// import '@syncfusion/ej2-inputs/styles/material.css';
// import '@syncfusion/ej2-lists/styles/material.css';
// import '@syncfusion/ej2-navigations/styles/material.css';
// import '@syncfusion/ej2-popups/styles  /material.css';
// import '@syncfusion/ej2-splitbuttons/styles/material.css';
// import '@syncfusion/ej2-grids/styles/material.css';
// import '@syncfusion/ej2-react-spreadsheet/styles/material.css';

interface SyncfusionSpreadsheetProps {
  initialData: any[];
  onSave: (data: any) => void;
}

export function SyncfusionSpreadsheet({ initialData, onSave }: SyncfusionSpreadsheetProps) {
  const spreadsheetRef = useRef<SpreadsheetComponent>(null);

  useEffect(() => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      // You can interact with the spreadsheet API here if needed
      // For example, to lock formula cells:
      spreadsheet.cellFormat({ fontWeight: 'bold' }, 'A1:E1');
      spreadsheet.lockCells('E2:E10', true); // Lock the formula column
    }
  }, [spreadsheetRef]);

  const handleSave = () => {
    if (spreadsheetRef.current) {
      spreadsheetRef.current.saveAsJson().then((json) => {
        onSave(json.jsonData);
      });
    }
  };

  // NOTE: The Syncfusion component is feature-rich. This is a basic setup.
  // The data binding below is a simplified example. For a real application,
  // you would dynamically generate these directives based on `initialData`.

  return (
    <div className="h-[600px] w-full">
        <style>
            {`
                @import url('https://cdn.syncfusion.com/ej2/material.css');
            `}
        </style>
        <SpreadsheetComponent
            ref={spreadsheetRef}
            saveUrl="https://services.syncfusion.com/react/production/api/spreadsheet/save"
            openUrl="https://services.syncfusion.com/react/production/api/spreadsheet/open"
            allowSave={true}
            allowOpen={true}
            showFormulaBar={false}
            showSheetTabs={false}
            showRibbon={false}
        >
            <SheetsDirective>
            <SheetDirective name="Manufacturing Facilities">
                <RangesDirective>
                <RangeDirective dataSource={initialData}></RangeDirective>
                </RangesDirective>
                <ColumnsDirective>
                    <ColumnDirective width={150}></ColumnDirective>
                    <ColumnDirective width={150}></ColumnDirective>
                    <ColumnDirective width={120}></ColumnDirective>
                    <ColumnDirective width={120}></ColumnDirective>
                    <ColumnDirective width={150}></ColumnDirective>
                </ColumnsDirective>
                <RowsDirective>
                    <RowDirective>
                        <CellsDirective>
                            <CellDirective value="Facility Name" style={{ fontWeight: 'bold', textAlign: 'center' }}></CellDirective>
                            <CellDirective value="Location" style={{ fontWeight: 'bold', textAlign: 'center' }}></CellDirective>
                            <CellDirective value="Capacity (Units)" style={{ fontWeight: 'bold', textAlign: 'center' }}></CellDirective>
                            <CellDirective value="Utilization (%)" style={{ fontWeight: 'bold', textAlign: 'center' }}></CellDirective>
                            <CellDirective value="Is WHO-GMP Certified" style={{ fontWeight: 'bold', textAlign: 'center' }}></CellDirective>
                        </CellsDirective>
                    </RowDirective>
                     <RowDirective>
                        <CellsDirective>
                            <CellDirective value="Plant A"></CellDirective>
                            <CellDirective value="Mumbai"></CellDirective>
                            <CellDirective value="100000"></CellDirective>
                            <CellDirective value="85"></CellDirective>
                            <CellDirective value="Yes"></CellDirective>
                        </CellsDirective>
                    </RowDirective>
                    <RowDirective>
                        <CellsDirective>
                            <CellDirective value="Plant B"></CellDirective>
                            <CellDirective value="Pune"></CellDirective>
                            <CellDirective value="50000"></CellDirective>
                            <CellDirective value="92"></CellDirective>
                            <CellDirective value="Yes"></CellDirective>
                        </CellsDirective>
                    </RowDirective>
                     <RowDirective>
                        <CellsDirective>
                            <CellDirective value="Total" style={{ fontWeight: 'bold' }}></CellDirective>
                            <CellDirective value=""></CellDirective>
                            <CellDirective formula="=SUM(C2:C3)" style={{ fontWeight: 'bold' }} isLocked={true}></CellDirective>
                            <CellDirective formula="=AVERAGE(D2:D3)" style={{ fontWeight: 'bold' }} isLocked={true}></CellDirective>
                            <CellDirective value=""></CellDirective>
                        </CellsDirective>
                    </RowDirective>
                </RowsDirective>
            </SheetDirective>
            </SheetsDirective>
        </SpreadsheetComponent>
    </div>
  );
}
