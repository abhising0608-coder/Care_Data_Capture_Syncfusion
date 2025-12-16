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
  CellModel,
  SheetModel,
} from '@syncfusion/ej2-react-spreadsheet';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Save, Plus, Trash2, History, Undo } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Version {
  version: number;
  timestamp: string;
  data: any[];
}

interface SpreadsheetData {
  versions: Version[];
  activeVersion: number;
}

interface SyncfusionSpreadsheetProps {
  data: SpreadsheetData;
  onSave: (data: any[]) => void;
  onRollback: (version: number) => void;
}

const HEADERS = ['Sr. No.', 'Location', 'Product Segment', 'Regulatory Approvals', 'Last Audit (Month/Year)'];

export function SyncfusionSpreadsheet({ data, onSave, onRollback }: SyncfusionSpreadsheetProps) {
  const spreadsheetRef = useRef<SpreadsheetComponent>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(data.activeVersion);

  const activeData = useMemo(() => {
    const versionData = data.versions.find(v => v.version === selectedVersion);
    return versionData ? versionData.data : [];
  }, [data.versions, selectedVersion]);


  useEffect(() => {
    setSelectedVersion(data.activeVersion);
  }, [data.activeVersion]);

  useEffect(() => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      // Clear previous data before loading new data
      spreadsheet.clear();
      
      const sheet: SheetModel = {
        rows: [],
        columns: [
          { width: 80 }, { width: 150 }, { width: 150 }, { width: 200 }, { width: 180 }
        ]
      };
      
      // Header Row
      const headerRow: RowModel = {
        cells: HEADERS.map(header => ({
          value: header,
          style: { fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#f0f0f0' }
        }))
      };
      sheet.rows!.push(headerRow);
      
      // Data Rows
      if(activeData && activeData.length > 0) {
        activeData.forEach((rowData, index) => {
          const cells: CellModel[] = HEADERS.map(header => ({
            value: rowData[header] || ''
          }));
          sheet.rows!.push({ cells });
        });
      }
      
      spreadsheet.sheets = [sheet];
      spreadsheet.lockCells('A1:E1', true); // Lock header
      spreadsheet.activeSheetIndex = 0;
      spreadsheet.dataBind();
    }
  }, [activeData, spreadsheetRef]);


  const handleAddRow = () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      const currentSheet = spreadsheet.sheets[spreadsheet.activeSheetIndex];
      const lastSrNo = currentSheet.rows && currentSheet.rows.length > 1 
        ? currentSheet.rows.length -1
        : 0;

      const newRow = {
        index: currentSheet.rows ? currentSheet.rows.length : 1,
        cells: [{ value: (lastSrNo + 1).toString() }, ...Array(HEADERS.length - 1).fill({ value: '' })]
      };
      spreadsheet.insertRow([newRow]);
    }
  };

  const handleSave = async () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      const json = await spreadsheet.saveAsJson();
      const sheetData = json.sheets[0];
      const dataToSave: any[] = [];
      
      if (sheetData.rows) {
        // Start from row 1 to skip header
        for (let i = 1; i < sheetData.rows.length; i++) {
          const row = sheetData.rows[i];
          if (row && row.cells) {
            const rowData: { [key: string]: any } = {};
            let isRowEmpty = true;
            HEADERS.forEach((header, j) => {
              const cellValue = row.cells![j]?.value;
              rowData[header] = cellValue || '';
              if (cellValue) isRowEmpty = false;
            });
            if (!isRowEmpty) {
              dataToSave.push(rowData);
            }
          }
        }
      }
      onSave(dataToSave);
    }
  };
  
  const handleClear = () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
        const rowCount = spreadsheet.sheets[0].rows?.length || 0;
        if(rowCount > 1) {
            spreadsheet.deleteRow(1, rowCount - 1);
        }
    }
  };

  const handleRollback = () => {
    if (selectedVersion) {
      onRollback(selectedVersion);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 p-2 border rounded-md">
        <div className='flex items-center gap-2'>
            <Button onClick={handleAddRow} size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Row</Button>
            <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4" /> Save as New Version</Button>
            <Button onClick={handleClear} size="sm" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear Sheet</Button>
        </div>
        <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <Select 
                value={selectedVersion?.toString()}
                onValueChange={(val) => setSelectedVersion(Number(val))}
            >
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a version to view" />
                </SelectTrigger>
                <SelectContent>
                    {data.versions.slice().reverse().map(v => (
                        <SelectItem key={v.version} value={v.version.toString()}>
                           Version {v.version} ({formatTimestamp(v.timestamp)}) {v.version === data.activeVersion ? '(Active)' : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button 
                onClick={handleRollback} 
                size="sm" 
                variant="secondary" 
                disabled={selectedVersion === data.activeVersion}
            >
                <Undo className="mr-2 h-4 w-4" /> Rollback to Selected
            </Button>
        </div>
      </div>
      <div className="h-[600px] w-full">
          <style>
              {`
                  @import url('https://cdn.syncfusion.com/ej2/material.css');
              `}
          </style>
          <SpreadsheetComponent
              ref={spreadsheetRef}
              showFormulaBar={false}
              showSheetTabs={false}
              showRibbon={false}
              allowSave={false}
              allowOpen={false}
          >
          </SpreadsheetComponent>
      </div>
    </div>
  );
}
