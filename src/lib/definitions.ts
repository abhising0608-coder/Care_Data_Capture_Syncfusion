
export type CKCRequest = {
  id: string; // Corresponds to document ID
  requestId: string; // The original request ID from the source system
  companyId: string;
  companyName: string;
  financialInputSector: string;
  listed: 'Yes' | 'No';
  rating: string;
  hoRoName: string;
  dealingAnalyst: string;
  groupHead: string;
  assignedTo: string | null;
  checker: string;
  status: 'PENDING' | 'ACCEPTED' | 'CLOSED';
  cycle: 'Initial' | 'Surveillance';
  auditedFY: string[];
  provisionalFY: string[];
  projectionFY: string[];
  remarks: string;
  receiptDateTime: string | Date; // Using ISO string or Date object
  receiptResponseDateTime: string | Date | null;
  entryAllottedDateTime: string | Date | null;
  entryCompletedDateTime: string | Date | null;
  checkingAllottedDateTime: string | Date | null;
  checkingCompletedDateTime: string | Date | null;
  sentBackFlag: boolean;
  createdBy: string;
  overallStatus: string;
  itemType: string;
  path: string;
  resultType: 'Standalone' | 'Consolidated';
  ckcAnalystName?: string;
};
