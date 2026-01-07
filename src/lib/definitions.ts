

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

export type FeedbackStatus = 'Pending' | 'In Progress' | 'Completed';

export type DiscussionStatus = 'Draft' | 'Shared with GH' | 'Completed';

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

export type QuestionnaireItem = {
  srNo: number;
  particulars: string;
  remarks?: string;
};

export interface DTContact {
    id: string;
    name: string;
    email: string;
    contact: string;
    discussionHappened: 'Yes' | 'No' | '';
    minutesCaptured: 'Yes' | 'No' | 'Partial';
    minutesCapturedOn: string | null;
    status: FeedbackStatus | null;
    questionnaire?: QuestionnaireItem[];
    summary?: string;
}

export interface DTFirm {
    id: string;
    firmName: string;
    contacts: DTContact[];
}

export interface IPAContact {
    id: string;
    name: string;
    email: string;
    contact: string;
    discussionHappened: 'Yes' | 'No' | '';
    minutesCaptured: 'Yes' | 'No' | 'Partial';
    minutesCapturedOn: string | null;
    status: FeedbackStatus | null;
    questionnaire?: QuestionnaireItem[];
    summary?: string;
}

export interface IPAFirm {
    id: string;
    firmName: string;
    contacts: IPAContact[];
}

export interface ManagementPersonnel {
  id: string;
  name: string;
  designation: string;
}

export interface DiscussionMinute {
  id: string;
  issue: string;
  response: string;
}

export interface ManagementDiscussion {
  id: string;
  companyId: string;
  interactionDate?: Date | null;
  location?: string;
  careTeam: string[];
  managementPersonnel: ManagementPersonnel[];
  discussionMinutes: DiscussionMinute[];
  status: DiscussionStatus;
}

export interface AuditCommitteePersonnel {
  id: string;
  name: string;
}

export interface AuditCommitteeMinute {
  id: string;
  issue: string;
  response: string;
}

export interface AuditCommitteeMeeting {
  id: string;
  companyId: string;
  interactionDate?: Date | null;
  location?: string;
  careTeam: string[];
  auditCommitteePersonnel: AuditCommitteePersonnel[];
  discussionMinutes: AuditCommitteeMinute[];
  status: DiscussionStatus;
}

export interface ThirdPartyContact {
  id: string;
  name: string;
  designation: string;
  email: string;
  isPrimary?: boolean;
}

export interface ThirdParty {
  id: string;
  name: string;
  relationship: string;
  contacts: ThirdPartyContact[];
}

export interface ThirdPartyPersonnel {
  id: string;
  name: string;
  designation: string;
}

export interface ThirdPartyMinute {
  id: string;
  query: string;
  response: string;
}

export interface ThirdPartyCheck {
    id: string;
    companyId: string;
    organizationId: string;
    interactionDate?: Date | null;
    location?: string;
    careTeam: string[];
    thirdPartyPersonnel: ThirdPartyPersonnel[];
    discussionMinutes: ThirdPartyMinute[];
    status: DiscussionStatus;
}


export interface RatingNote {
  id: string;
  companyName: string;
  companyId: string;
  ratingCycle: 'Initial' | 'Surveillance';
  priority: CompanyPriority;
  dueDate: string;
  status: NoteStatus;
  currentActor: Role;
  initiatedBy: string; // RA's ID
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
  // This will hold the full JSON data structure
  ratingNoteData?: RatingNoteDataSchema; 
}


// --- New FSD-based Schema Definitions ---

export interface DocumentMeta {
  templateId: string;
  templateVersion: string;
  sector: string;
  totalPagesExpected: number;
  sfdtStoragePath: string;
  language: string;
  currency: string;
  unit: string;
}

export interface WorkflowContext {
  mandateId: string;
  ratingType: string;
  committeeDate: string;
  currentStage: string;
  status: string;
}

export interface DataBindings {
  company: {
    name: string;
    cin: string;
    incorporationDate: string;
    natureOfBusiness: string;
    groupName: string;
    registeredOffice: string;
    website: string;
  };
  management: {
    ceo: string;
    cfo: string;
    chairman: string;
    companySecretary: string;
    employees: number;
  };
  rating: {
    recommendedLongTerm: string;
    recommendedShortTerm: string;
    finalRating: string;
    unsupportedRatings: string;
    absenceOfPendingDocs: string;
  };
  analyst: {
    analyst1: string;
    analyst2: string;
    groupHead: string;
    ratingHead: string;
  };
}

export interface TableRowData {
  [key: string]: string | number;
}

export interface TableDefinition {
  sfdtTableId: string;
  repeatable?: boolean;
  financialYearScoped?: boolean;
  columns?: string[];
  rows?: TableRowData[];
  years?: string[];
  metrics?: {
    [metricName: string]: (string | number)[];
  };
}

export interface Tables {
  [tableName: string]: TableDefinition;
}

export interface Permissions {
  [role: string]: {
    editableSections?: string[];
    readOnly?: boolean;
  };
}

export interface Audit {
  version: number;
  lastSavedBy: string;
  lastSavedRole: Role;
  lastSavedAt: string;
  changeSummary: string;
}

// This is the master schema for the entire rating note data
export interface RatingNoteDataSchema {
  documentMeta: DocumentMeta;
  workflowContext: WorkflowContext;
  dataBindings: DataBindings;
  tables: Tables;
  permissions: Permissions;
  audit: Audit;
  editorContent?: string; // To store the latest SFDT
}
