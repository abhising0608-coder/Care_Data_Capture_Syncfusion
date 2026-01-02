export type Role = 'CKC_ANALYST' | 'CKC_CHECKER' | 'CKC_ADMIN' | 'RATING_ANALYST' | 'GROUP_HEAD' | 'RATING_HEAD_SD' | 'SYSTEM' | 'QC' | 'RATING_COMMITTEE';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'SUBMITTED_FOR_CHECK' | 'SENT_BACK' | 'APPROVED' | 'CLOSED';

// More granular statuses for the entire rating note workflow
export type NoteStatus = 
  | 'Draft'
  | 'In Review (GH)'
  | 'Rework Requested' // From GH to RA
  | 'In Review (QC)'
  | 'Rework Requested (GH)' // From QC/CC to GH
  | 'QC Approved'
  | 'In Review (CC)'
  | 'CC Approved'
  | 'Pending RR & PR (RA)'
  | 'In Final Review (GH)'
  | 'Completed';

export type CompanyPriority = 'High' | 'Medium' | 'Low';


export type StatusHistory = {
  status: RequestStatus;
  timestamp: string | Date;
  actorId: string;
  actorRole: Role;
  remarks?: string;
};

export type AppUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  role: Role;
  photoURL?: string | null;
};

export interface CompanyDashboard {
    id: string; // This will be the rating note ID
    companyName: string;
    ratingCycle: 'Initial' | 'Surveillance';
    priority: CompanyPriority;
    dueDate: string;
    status: NoteStatus;
    raId: string;
    ghId?: string;
}

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
  status: RequestStatus;
  cycle: 'Initial' | 'Surveillance';
  auditedFY: string[];
  provisionalFY: string[];
  projectionFY: [];
  remarks: string;
  receiptDateTime: string | Date;
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
  currentOwnerId: string | null;
  currentOwnerRole: Role | null;
  assignedCheckerId: string | null;
  statusHistory: StatusHistory[];
};

export type CompanyMaster = {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  listingStatus: string;
  listingIn: string;
  macroEconomicIndicator: string;
  sector: string;
  industry: string;
  basicIndustry: string;
};

export type GroupSelection = {
  group: string;
  groupForCombinedApproach: string;
};

export type ContactDetail = {
  id: string;
  name: string;
  designation: string;
  department?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  isPrimary?: boolean;
  isUPSI?: boolean;
  authorizedSignatory?: boolean;
  source: 'CRM' | 'Rating';
  isDeleted: boolean;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  pendingSync: boolean;
};

export type DetailItem = {
  id: string;
  [key: string]: any;
};

export type CompanyInfo = {
  masterSnapshot: CompanyMaster;
  groupSelection: GroupSelection;
  contactDetails: ContactDetail[];
  auditorDetails: DetailItem[];
  bankerDetails: DetailItem[];
  dtDetails: DetailItem[];
  ipaDetails: DetailItem[];
  thirdPartyDetails: DetailItem[];
  syncStatus: {
    source: 'CRM' | 'Rating';
    lastUpdatedBy: string;
    lastUpdatedAt: string;
  };
};

export interface RatingNote {
  id: string;
  companyName: string;
  companyId: string;
  ratingCycle: 'Initial' | 'Surveillance';
  priority: CompanyPriority;
  dueDate: string;
  status: NoteStatus;
  raId: string; // Rating Analyst ID
  ghId?: string; // Group Head ID
  qcId?: string; // QC ID
  ccId?: string; // Care Committee ID
  editorContent?: string; // The SFDT content of the Syncfusion editor
  rrContent?: string; // Rating Rationale content
  prContent?: string; // Press Release content
  statusHistory: {
      status: NoteStatus;
      timestamp: string;
      actorId: string;
  }[];
}
