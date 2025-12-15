export type CKCRequest = {
  id: string; // Corresponds to requestId
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
  receiptDateTime: any; // Using any for Firestore Timestamps
  receiptResponseDateTime: any | null;
  entryAllottedDateTime: any | null;
  entryCompletedDateTime: any | null;
  checkingAllottedDateTime: any | null;
  checkingCompletedDateTime: any | null;
  sentBackFlag: boolean;
  createdBy: string;
  overallStatus: string;
  itemType: string;
  path: string;
  resultType: 'Standalone' | 'Consolidated';
  ckcAnalystName?: string;
};
