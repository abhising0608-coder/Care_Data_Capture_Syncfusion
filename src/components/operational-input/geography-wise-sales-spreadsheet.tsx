
'use client';

import {
  SpreadsheetComponent,
  SheetModel,
  ColumnModel,
  CellModel,
  getRangeAddress,
} from '@syncfusion/ej2-react-spreadsheet';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { create, all } from 'mathjs';

const math = create(all);

interface Version {
  version: number;
  timestamp: string;
  data: Record<string, Record<string, number | string>>;
}

interface SpreadsheetData {
  versions: Version[];
  activeVersion: number;
}

interface GeographyWiseSalesSpreadsheetProps {
  data: SpreadsheetData;
  onSave: (data: Record<string, Record<string, number | string>>) => void;
  onRollback: (version: number) => void;
}

const ROW_CONFIG = [
  { name: 'Domestic', isEditable: true, isBold: false, parent: null },
  { name: 'Export', isEditable: false, isBold: true, parent: null, formula: (usa: number, row: number) => usa + row },
  { name: 'USA', isEditable: true, isBold: false, parent: 'Export', indent: 1 },
  { name: 'Rest of the World', isEditable: true, isBold: false, parent: 'Export', indent: 1 },
  { name: 'Others', isEditable: true, isBold: false, parent: 'Export', indent: 1 },
  { name: 'Total Sales', isEditable: false, isBold: true, parent: null, formula: (dom: number, exp: number) => dom + exp },
];

const DERIVED_ROWS = ['% Share', 'YoY Growth'];
const ROW_COUNT = ROW_CONFIG.length + DERIVED_ROWS.length * ROW_CONFIG.length;


export function GeographyWiseSalesSpreadsheet({ data, onSave }: GeographyWiseSalesSpreadsheetProps) {
  const spreadsheetRef = useRef<SpreadsheetComponent>(null);

  const getDynamicColumns = () => {
    const currentYear = new Date().getFullYear();
    const lastFYEnd = new Date().getMonth() < 3 ? currentYear : currentYear + 1;
    const periods = [];
    for (let i = 3; i > 0; i--) {
      periods.push(`FY${(lastFYEnd - i - 1).toString().slice(2)}-${(lastFYEnd - i).toString().slice(2)}`);
    }
    periods.push(`Interim`);
    return periods;
  };

  const dynamicPeriods = useMemo(getDynamicColumns, []);

  const activeData = useMemo(() => {
    if (!data || !data.versions || data.versions.length === 0) {
      return {};
    }
    const versionData = data.versions.find(v => v.version === data.activeVersion);
    return versionData ? versionData.data : {};
  }, [data]);
  
  const onCreated = useCallback(() => {
    const spreadsheet = spreadsheetRef.current;
    if (!spreadsheet) return;
    spreadsheet.off('cellSave', onCellSave);
    spreadsheet.on('cellSave', onCellSave, this);
    constructSheet(spreadsheet);
  }, [activeData, dynamicPeriods]);
  
  useEffect(() => {
      const spreadsheet = spreadsheetRef.current;
      if (spreadsheet) {
          constructSheet(spreadsheet);
      }
  }, [activeData]);


  const constructSheet = (spreadsheet: SpreadsheetComponent) => {
    const columns: ColumnModel[] = [
      { width: 200 },
      ...dynamicPeriods.map(() => ({ width: 120 })),
    ];

    const rows: any[] = [];
    
    // Header Row
    const headerCells: CellModel[] = [{ value: 'Particulars', style: { fontWeight: 'bold', backgroundColor: '#f0f0f0' } }];
    dynamicPeriods.forEach(period => {
      headerCells.push({ value: period, style: { fontWeight: 'bold', backgroundColor: '#f0f0f0' } });
    });
    rows.push({ cells: headerCells });

    // Data and Formula Rows
    ROW_CONFIG.forEach(rowConfig => {
      const dataCells: CellModel[] = [{ value: rowConfig.name, style: { fontWeight: rowConfig.isBold ? 'bold' : 'normal', textIndent: `${(rowConfig.indent || 0) * 20}px` } }];
      dynamicPeriods.forEach(period => {
        const value = activeData[rowConfig.name]?.[period] ?? '';
        dataCells.push({ value: value.toString() });
      });
      rows.push({ cells: dataCells });

      DERIVED_ROWS.forEach(derived => {
        const derivedCells: CellModel[] = [{ value: `${rowConfig.name} ${derived}`, style: { fontStyle: 'italic', textIndent: `${(rowConfig.indent || 0) * 20}px` } }];
        dynamicPeriods.forEach(() => derivedCells.push({ value: '' })); // Placeholder for formulas
        rows.push({ cells: derivedCells });
      });
    });

    const sheet: SheetModel = { rows, columns, protectSettings: { selectUnLockedCells: true } };
    spreadsheet.sheets = [sheet];
    spreadsheet.activeSheetIndex = 0;
    
    // Apply formulas and locks after rendering
    spreadsheet.merge('A1:A1'); // Placeholder to trigger refresh
    setTimeout(() => applyFormulasAndLocks(spreadsheet), 0);
  };
  
  const getRowIndex = (name: string) => {
    let baseIndex = -1;
    let foundIndex = -1;
    ROW_CONFIG.forEach((cfg, idx) => {
      if (cfg.name === name) {
        baseIndex = idx;
      }
    });

    if (baseIndex !== -1) {
      foundIndex = 1 + baseIndex * (1 + DERIVED_ROWS.length);
    }
    return foundIndex;
  }
  
  const getCellAddress = (rowName: string, period: string) => {
      const rowIndex = getRowIndex(rowName);
      const colIndex = dynamicPeriods.indexOf(period) + 1;
      if (rowIndex === -1 || colIndex === 0) return null;
      return getRangeAddress([rowIndex, colIndex]);
  }


  const applyFormulasAndLocks = (spreadsheet: SpreadsheetComponent) => {
    spreadsheet.lockCells('A1:' + getRangeAddress([0, dynamicPeriods.length]), true);

    ROW_CONFIG.forEach((rowConfig) => {
        const baseRowIdx = getRowIndex(rowConfig.name);
        if (baseRowIdx === -1) return;

        // Lock/Unlock data entry rows
        const lockRange = `B${baseRowIdx + 1}:${getRangeAddress([baseRowIdx, dynamicPeriods.length])}`;
        spreadsheet.lockCells(lockRange, !rowConfig.isEditable);

        dynamicPeriods.forEach((period, colIdx) => {
            const currentCol = String.fromCharCode(66 + colIdx); // B, C, D...

            // Export formula
            if (rowConfig.name === 'Export') {
                const usaAddr = getCellAddress('USA', period);
                const rowAddr = getCellAddress('Rest of the World', period);
                const othersAddr = getCellAddress('Others', period);
                if (usaAddr && rowAddr && othersAddr) {
                    spreadsheet.updateCell({ formula: `=SUM(${usaAddr},${rowAddr},${othersAddr})` }, `${currentCol}${baseRowIdx + 1}`);
                }
            }

            // Total Sales formula
            if (rowConfig.name === 'Total Sales') {
                const domAddr = getCellAddress('Domestic', period);
                const expAddr = getCellAddress('Export', period);
                if (domAddr && expAddr) {
                    spreadsheet.updateCell({ formula: `=SUM(${domAddr},${expAddr})` }, `${currentCol}${baseRowIdx + 1}`);
                }
            }

            // % Share formula
            const shareRowIdx = baseRowIdx + 1;
            const totalSalesAddr = getCellAddress('Total Sales', period);
            if (totalSalesAddr) {
                const formula = `=IFERROR((${currentCol}${baseRowIdx + 1}/${totalSalesAddr})*100, 0)`;
                spreadsheet.updateCell({ formula, format: '0.00"%"' }, `${currentCol}${shareRowIdx + 1}`);
                spreadsheet.lockCells(`${currentCol}${shareRowIdx + 1}`, true);
            }

            // YoY Growth formula
            const yoyRowIdx = baseRowIdx + 2;
            if (colIdx > 0) {
                const prevCol = String.fromCharCode(65 + colIdx);
                const formula = `=IFERROR(((${currentCol}${baseRowIdx+1}-${prevCol}${baseRowIdx+1})/${prevCol}${baseRowIdx+1})*100, 0)`;
                spreadsheet.updateCell({ formula, format: '0.00"%"' }, `${currentCol}${yoyRowIdx + 1}`);
            } else {
                 spreadsheet.updateCell({ value: 'N/A' }, `${currentCol}${yoyRowIdx + 1}`);
            }
            spreadsheet.lockCells(`${currentCol}${yoyRowIdx + 1}`, true);
        });
    });
  };

  const onCellSave = (args: any) => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet && args.isFormula) {
        spreadsheet.refresh();
    }
  };


  const handleSave = async () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      const dataToSave: Record<string, Record<string, number | string>> = {};
      
      ROW_CONFIG.forEach(rowConfig => {
        if (rowConfig.isEditable) {
            const rowIndex = getRowIndex(rowConfig.name);
            dataToSave[rowConfig.name] = {};
            dynamicPeriods.forEach(async (period, colIndex) => {
                const address = getRangeAddress([rowIndex, colIndex + 1]);
                const cell = await spreadsheet.getCell(rowIndex, colIndex + 1);
                let value = cell.value;
                 if(typeof value === 'string' && !isNaN(parseFloat(value))) {
                    value = parseFloat(value);
                }
                if (value !== undefined && value !== null && value !== '') {
                    dataToSave[rowConfig.name][period] = value as number | string;
                }
            });
        }
      });
      
      onSave(dataToSave);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start gap-2 p-2 border rounded-md">
        <Button onClick={handleSave} size="sm">
          <Save className="mr-2 h-4 w-4" /> Save as New Version
        </Button>
      </div>
      <div className="h-[600px] w-full">
        <style>
          {`@import url('https://cdn.syncfusion.com/ej2/material.css');`}
        </style>
        <SpreadsheetComponent
          ref={spreadsheetRef}
          created={onCreated}
          showFormulaBar={false}
          showSheetTabs={false}
          showRibbon={false}
          allowSave={true}
          allowOpen={false}
          cellSave={onCellSave}
        ></SpreadsheetComponent>
      </div>
    </div>
  );
}
