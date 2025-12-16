
'use client';
import {
  SpreadsheetComponent,
  SheetModel,
  RowModel,
  CellModel,
} from '@syncfusion/ej2-react-spreadsheet';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Save, Plus, Trash2, History, Undo } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { registerLicense } from '@syncfusion/ej2-base';

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
  registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF5cXGpCf0x3QXxbf1x2ZFRHal5ZTndbUj0eQnxTdEBiW35bcndXTmFVV01/VkleYQ==');
  const activeData = useMemo(() => {
    // Always show the active version's data
    if (!data || !data.versions) {
      return [];
    }
    const versionData = data.versions.find(v => v.version === data.activeVersion);
    return versionData ? versionData.data : [];
  }, [data]);


  const loadSheetData = useCallback((spreadsheet: SpreadsheetComponent | null) => {
    if (!spreadsheet) return;

    const sheet: SheetModel = {
      rows: [],
      columns: [
        { width: 80 }, { width: 150 }, { width: 150 }, { width: 200 }, { width: 180 }
      ]
    };

    const headerRow: RowModel = {
      cells: HEADERS.map(header => ({
        value: header,
        style: { fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#f0f0f0' }
      }))
    };
    sheet.rows!.push(headerRow);
    
    if (activeData && activeData.length > 0) {
      activeData.forEach((rowData) => {
        const cells: CellModel[] = HEADERS.map(header => ({
          value: rowData[header] || ''
        }));
        const newSrNo = (sheet.rows?.length || 0);
        cells[0] = { value: newSrNo.toString() };
        sheet.rows!.push({ cells });
      });
    }

    spreadsheet.sheets = [sheet];
    spreadsheet.lockCells('A1:E1', true);
    spreadsheet.activeSheetIndex = 0;
    spreadsheet.dataBind();
  }, [activeData]);


  useEffect(() => {
    if (spreadsheetRef.current) {
        loadSheetData(spreadsheetRef.current);
    }
  }, [activeData, loadSheetData]);

  const onCreated = useCallback(() => {
    if (spreadsheetRef.current) {
        loadSheetData(spreadsheetRef.current);
    }
  }, [loadSheetData]);

  const handleAddRow = () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      const currentSheet = spreadsheet.sheets[spreadsheet.activeSheetIndex];
      const lastSrNo = currentSheet.rows && currentSheet.rows.length > 1 
        ? currentSheet.rows.length
        : 1;

      const newRow = {
        index: currentSheet.rows ? currentSheet.rows.length : 1,
        cells: [{ value: lastSrNo.toString() }, ...Array(HEADERS.length - 1).fill({ value: '' })]
      };
      spreadsheet.insertRow([newRow]);
    }
  };

  const handleSave = async () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      // The saveAsJson method is asynchronous and returns a Promise
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
              if (cellValue && j > 0) isRowEmpty = false; // Check if any cell other than Sr. No. has data
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start gap-2 p-2 border rounded-md">
        <Button onClick={handleAddRow} size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Row</Button>
        <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4" /> Save as New Version</Button>
      </div>
      <div className="h-[600px] w-full">
          <style>
              {`
                  @import url('https://cdn.syncfusion.com/ej2/material.css');
              `}
          </style>
          <SpreadsheetComponent
              ref={spreadsheetRef}
              created={onCreated}
              showFormulaBar={false}
              showSheetTabs={false}
              showRibbon={false}
              allowSave={true}
              allowOpen={false}
          >
          </SpreadsheetComponent>
      </div>
    </div>
  );
}
