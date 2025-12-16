
'use client';

import {
  SpreadsheetComponent,
  SheetModel,
  ColumnModel,
  CellModel,
} from '@syncfusion/ej2-react-spreadsheet';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';

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
  { name: 'Domestic', isEditable: true, isBold: true, parent: null, indent: 0 },
  { name: 'Export', isEditable: false, isBold: true, parent: null, indent: 0 },
  { name: 'USA', isEditable: true, isBold: false, parent: 'Export', indent: 1 },
  { name: 'Rest of the World', isEditable: true, isBold: false, parent: 'Export', indent: 1 },
  { name: 'Others', isEditable: true, isBold: false, parent: 'Export', indent: 1 },
  { name: 'Total Sales', isEditable: false, isBold: true, parent: null, indent: 0 },
];

export function GeographyWiseSalesSpreadsheet({ data, onSave }: GeographyWiseSalesSpreadsheetProps) {
  const spreadsheetRef = useRef<SpreadsheetComponent>(null);

  const getDynamicPeriods = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const lastFYEnd = new Date().getMonth() < 3 ? currentYear : currentYear + 1;
    const periods = [];
    for (let i = 3; i > 0; i--) {
      periods.push(`FY${(lastFYEnd - i).toString().slice(2)}`);
    }
    periods.push(`Interim`); // Or a more dynamic name like 6MFY25
    return periods;
  }, []);

  const dynamicPeriods = useMemo(getDynamicPeriods, [getDynamicPeriods]);

  const activeData = useMemo(() => {
    if (!data || !data.versions || data.versions.length === 0) {
      return {};
    }
    const versionData = data.versions.find(v => v.version === data.activeVersion);
    return versionData ? versionData.data : {};
  }, [data]);

    const applyFormattingAndFormulas = useCallback((spreadsheet: SpreadsheetComponent) => {
    const sheet = spreadsheet.sheets[0];
    if (!sheet || !sheet.rows) return;

    // Dynamically find row indices
    const findRowIndex = (name: string) => sheet.rows!.findIndex(r => r.cells?.[0]?.value === name);
    const domesticRow = findRowIndex('Domestic') + 1;
    const exportRow = findRowIndex('Export') + 1;
    const totalSalesRow = findRowIndex('Total Sales') + 1;
    const exportChildStartRow = exportRow + 1;
    const exportChildEndRow = totalSalesRow -1;


    // Merge header cells
    spreadsheet.merge('A1:A2');
    const fullFyPeriods = dynamicPeriods.filter(p => p.startsWith('FY'));
    
    dynamicPeriods.forEach((_period, i) => {
      const col = String.fromCharCode(66 + i * 2);
      const nextCol = String.fromCharCode(67 + i * 2);
      spreadsheet.merge(`${col}1:${nextCol}1`);
    });

    if (fullFyPeriods.length > 1) {
        const yoyCol = String.fromCharCode(66 + fullFyPeriods.length * 2);
        spreadsheet.merge(`${yoyCol}1:${yoyCol}2`);
    }

    // Apply formulas and locks for all data rows
    for (let r = 3; r <= sheet.rows.length; r++) {
        const rowConfig = ROW_CONFIG.find(rc => rc.name === sheet.rows![r-1].cells![0].value);

        if (!rowConfig) continue;

        if (!rowConfig.isEditable) {
             const lockRange = `B${r}:${String.fromCharCode(65 + dynamicPeriods.length * 2 + (fullFyPeriods.length > 1 ? 1 : 0))}${r}`;
             spreadsheet.lockCells(lockRange, true);
        }

        dynamicPeriods.forEach((_period, i) => {
            const valCol = String.fromCharCode(66 + i * 2);
            const shareCol = String.fromCharCode(67 + i * 2);

            // % Share Formula
            const shareFormula = `=IFERROR(${valCol}${r}/${valCol}${totalSalesRow}, 0)`;
            spreadsheet.updateCell({ formula: shareFormula }, `${shareCol}${r}`);
            spreadsheet.lockCells(`${shareCol}${r}`, true);
        });
      
        // Y-o-Y Growth Formula
        if (fullFyPeriods.length > 1) {
            const yoyCol = String.fromCharCode(66 + fullFyPeriods.length * 2);
            const latestFyValCol = String.fromCharCode(66 + (fullFyPeriods.length - 1) * 2);
            const prevFyValCol = String.fromCharCode(66 + (fullFyPeriods.length - 2) * 2);
            
            const yoyFormula = `=IFERROR((${latestFyValCol}${r}-${prevFyValCol}${r})/${prevFyValCol}${r}, 0)`;
            spreadsheet.updateCell({ formula: yoyFormula }, `${yoyCol}${r}`);
            spreadsheet.lockCells(`${yoyCol}${r}`, true);
        }
    }
    
    // Derived row formulas (Export, Total Sales)
    dynamicPeriods.forEach((_period, i) => {
      const valCol = String.fromCharCode(66 + i * 2);

      // Export = SUM of children
      if (exportChildEndRow >= exportChildStartRow) {
        const exportFormula = `=SUM(${valCol}${exportChildStartRow}:${valCol}${exportChildEndRow})`;
        spreadsheet.updateCell({ formula: exportFormula }, `${valCol}${exportRow}`);
      } else {
        spreadsheet.updateCell({ value: '0' }, `${valCol}${exportRow}`);
      }


      // Total Sales = Domestic + Export
      const totalSalesFormula = `=SUM(${valCol}${domesticRow},${valCol}${exportRow})`;
      spreadsheet.updateCell({ formula: totalSalesFormula }, `${valCol}${totalSalesRow}`);
    });
    
    spreadsheet.lockCells(`A1:${String.fromCharCode(65 + (sheet.columns?.length || 1) )}${sheet.rows.length}`, true);
    spreadsheet.lockCells(`A1:${String.fromCharCode(65 + (sheet.columns?.length || 1) )}2`, true);
    spreadsheet.element.focus(); // Refresh UI
  }, [dynamicPeriods]);

  const constructSheet = useCallback((spreadsheet: SpreadsheetComponent) => {
    const fullFyPeriods = dynamicPeriods.filter(p => p.startsWith('FY'));
    const interimPeriod = dynamicPeriods.find(p => !p.startsWith('FY'));

    const columns: ColumnModel[] = [{ width: 180 }]; // Region column
    dynamicPeriods.forEach(() => {
      columns.push({ width: 100 }); // Value column
      columns.push({ width: 80 });  // % Share column
    });
    // Add Y-o-Y growth column
    if (fullFyPeriods.length > 1) {
      columns.splice(1 + fullFyPeriods.length * 2, 0, { width: 120 });
    }

    const rows: any[] = [];
    const headerRow1: CellModel[] = [{ value: 'Region', style: { fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' } }];
    const headerRow2: CellModel[] = [{ value: '' }];

    fullFyPeriods.forEach(period => {
      headerRow1.push({ value: period, style: { fontWeight: 'bold', textAlign: 'center' } });
      headerRow1.push({ value: '' }); // Placeholder for merging
      headerRow2.push({ value: 'Value', style: { fontWeight: 'bold', textAlign: 'center' } });
      headerRow2.push({ value: '% Share', style: { fontWeight: 'bold', textAlign: 'center' } });
    });

    if (fullFyPeriods.length > 1) {
      headerRow1.splice(1 + fullFyPeriods.length * 2, 0, { value: 'Y-o-Y Growth (%)', style: { fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' } });
      headerRow2.splice(1 + fullFyPeriods.length * 2, 0, { value: '' });
    }

    if (interimPeriod) {
      headerRow1.push({ value: interimPeriod, style: { fontWeight: 'bold', textAlign: 'center' } });
      headerRow1.push({ value: '' }); // Placeholder for merging
      headerRow2.push({ value: 'Value', style: { fontWeight: 'bold', textAlign: 'center' } });
      headerRow2.push({ value: '% Share', style: { fontWeight: 'bold', textAlign: 'center' } });
    }

    rows.push({ cells: headerRow1, height: 30 }, { cells: headerRow2, height: 30 });

    ROW_CONFIG.forEach(rowConfig => {
      const dataCells: CellModel[] = [{
        value: rowConfig.name,
        style: {
          fontWeight: rowConfig.isBold ? 'bold' : 'normal',
          textIndent: `${rowConfig.indent * 20}px`,
          fontStyle: rowConfig.indent > 0 ? 'italic' : 'normal',
        }
      }];

      dynamicPeriods.forEach(period => {
        const value = activeData[rowConfig.name]?.[period] ?? '';
        dataCells.push({ value: value.toString(), format: '#,##0' }); // Value
        dataCells.push({ format: '0.00"%"' }); // % Share (formula)
      });
      
      // Add placeholder for YoY growth
      if (fullFyPeriods.length > 1) {
         dataCells.splice(1 + fullFyPeriods.length * 2, 0, { format: '0.00"%"' }); // YoY Growth
      }

      rows.push({ cells: dataCells });
    });

    spreadsheet.sheets = [{ rows, columns, showGridLines: false, protectSettings: { selectUnLockedCells: true } }];
    spreadsheet.activeSheetIndex = 0;
    
  }, [dynamicPeriods, activeData]);

  const onCreated = useCallback(() => {
    const spreadsheet = spreadsheetRef.current;
    if (!spreadsheet) return;
    constructSheet(spreadsheet);
    applyFormattingAndFormulas(spreadsheet);
  }, [constructSheet, applyFormattingAndFormulas]);

  useEffect(() => {
    const spreadsheet = spreadsheetRef.current;
    // Ensure the component is fully mounted and ready
    if (spreadsheet && spreadsheet.element.parentElement) {
      // Logic to update data without full reconstruction could go here
      // For now, we reconstruct, but in a more controlled way than before
      constructSheet(spreadsheet);
      applyFormattingAndFormulas(spreadsheet);
    }
  }, [activeData, constructSheet, applyFormattingAndFormulas]);


  const handleSave = async () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      const dataToSave: Record<string, Record<string, number | string>> = {};
      const sheet = spreadsheet.sheets[spreadsheet.activeSheetIndex];
      if (!sheet || !sheet.rows) return;

      for(let i = 0; i < sheet.rows.length; i++) {
        const row = sheet.rows[i];
        const rowConfig = ROW_CONFIG.find(c => c.name === row.cells?.[0].value)
        if (rowConfig && rowConfig.isEditable) {
            const rowName = row.cells?.[0].value as string;
            if(!rowName) continue;
            
            dataToSave[rowName] = {};

            for (let j = 0; j < dynamicPeriods.length; j++) {
                const period = dynamicPeriods[j];
                const colIndex = 1 + j * 2;
                const cell = await spreadsheet.getCell(i, colIndex);
                let value = cell.value;
                
                if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                  value = parseFloat(value);
                } else if (value === '' || value === undefined || value === null) {
                  continue;
                }
                dataToSave[rowName][period] = value as number | string;
            }
        }
      }
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
      <div className="h-[400px] w-full">
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
          cellEdit={(args) => {
              // After a cell is edited, re-apply formulas to ensure dependent cells are updated
              if (spreadsheetRef.current) {
                  setTimeout(() => applyFormattingAndFormulas(spreadsheetRef.current!), 100);
              }
          }}
        ></SpreadsheetComponent>
      </div>
    </div>
  );
}
