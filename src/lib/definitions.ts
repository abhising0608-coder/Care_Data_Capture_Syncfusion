import type { Timestamp } from 'firebase/firestore';

export type CKCRequest = {
  id: string; // Corresponds to document ID in Firestore
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
  receiptDateTime: Timestamp; 
  receiptResponseDateTime: Timestamp | null;
  entryAllottedDateTime: Timestamp | null;
  entryCompletedDateTime: Timestamp | null;
  checkingAllottedDateTime: Timestamp | null;
  checkingCompletedDateTime: Timestamp | null;
  sentBackFlag: boolean;
  createdBy: string;
  overallStatus: string;
  itemType: string;
  path: string;
  resultType: 'Standalone' | 'Consolidated';
  ckcAnalystName?: string;
};
