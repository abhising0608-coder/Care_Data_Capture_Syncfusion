

export type Role = 'CKC_ANALYST' | 'CKC_CHECKER' | 'CKC_ADMIN' | 'RATING_ANALYST' | 'GROUP_HEAD' | 'RATING_HEAD_SD' | 'SYSTEM' | 'QC' | 'RATING_COMMITTEE' | 'AUDITOR' | 'EDITOR';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'SUBMITTED_FOR_CHECK' | 'SENT_BACK' | 'APPROVED' | 'CLOSED' | 'REJECTED' | 'WITHDRAWN' | 'ON_HOLD';

// More granular statuses for the entire rating note workflow
export type NoteStatus = 
  | 'Draft'
  | 'In Review (GH)'
  | 'Rework Requested (GH)'
  | 'GH Approved'
  | 'In Review (RH)'
  | 'Rework Requested (RH)'
  | 'RH Approved'
  | 'In Review (QC)'
  | 'Rework Requested (QC)'
  | 'QC Approved'
  | 'In Review (Auditor)'
  | 'Rework Requested (Auditor)'
  | 'Auditor Approved'
  | 'In Review (Editor)'
  | 'Rework Requested (Editor)'
  | 'PR Generation Pending' // Legacy status from initial note flow
  | 'Sent to Client'
  | 'Completed';

export type CompanyPriority = 'High' | 'Medium' | 'Low';

export type FeedbackStatus = 'Pending' | 'In Progress' | 'Completed';

export type DiscussionStatus = 'Draft' | 'Shared with GH' | 'Completed';

export type ActivityStatus = 'Not Initiated' | 'In Progress' | 'Completed';

export interface CKCRequestDocument {
  id: string;
  docType: 'Audited FY' | 'Provisional FY' | 'Projection';
  year: string;
  fileName: string;
  valid: 'Yes' | 'No';
}

export interface CKCRequest {
  id: string;
  companyId: string;
  companyName: string;
  finInputSector: 'Manufacturing' | 'Bank' | 'NBFC' | 'HFC';
  listed: 'Yes' | 'No';
  cycle: 'Initial' | 'Surveillance';
  receivedDate: string;
  auditedFY: string;
  status: RequestStatus;
  resultType: 'Standalone' | 'Consolidated';
  createdBy?: string;
  groupHead?: string;
  rejectionDate?: string;
  rejectionComments?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  onHoldDate?: string;
  onHoldBy?: string;
  onHoldReason?: string;
  subStatus?: 'Not Allotted' | 'WIP' | 'Checking Pending' | 'CWIP' | 'In-Review' | 'Closed';
  hoRoName?: string;
  analystName?: string;
  closedDate?: string;
  documents: CKCRequestDocument[];
}

export interface PastFinancialPeriod {
  periodId: string;
  period: string;
  resultType: 'Actual' | 'Projection';
  financialStatus: 'WIP' | 'Checked';
  operationalStatus: 'WIP' | 'Checked';
  kpuMaker: string;
  kpuChecker: string;
  ratingAnalyst: string;
  updatedBy: string;
  updatedOn: string;
  status: 'Active' | 'In-active';
}

export interface CkcMandateDetails {
    mandateInfo: {
        mandateId: string;
        mandateType: string;
        mandateDate: string;
        receivedDate: string;
        regionBranch: string;
        bdName: string;
        ratingGhName: string;
        vertical: string;
    };
    companyInfo: {
        address: string;
        city: string;
        zipcode: string;
        state: string;
        country: string;
        instrument: string;
        instrumentSize: string;
        industry: string;
        subIndustry: string;
        sector: string;
    };
}


export type StatusHistory = {
  status: NoteStatus | RequestStatus;
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

export type PortfolioActivity = {
  id: string;
  name: string;
  status: ActivityStatus;
  action: 'Rollback' | 'Attach RN' | 'Initiate' | null;
};

export type PressReleaseHistoryInstrument = {
  insId: string;
  category: string;
  subCategory: string;
  instrumentName: string;
  instrumentSize: number;
  agendaType: string;
  ratingAssigned: string;
};

export type PressReleaseHistoryMandate = {
  mandateId: string;
  instruments: PressReleaseHistoryInstrument[];
};

export type PressReleaseHistoryEntry = {
  id: string;
  pressReleaseDate: string;
  mandates: PressReleaseHistoryMandate[];
};

export type DMSDocumentHistory = {
  documentName: string;
  dmsStatus: 'Pending' | 'Uploaded' | 'Reviewed';
  dmsProcessType: 'Revalidation' | 'Review';
  dmsUploadedOn: string;
  dmsUploadedBy: string;
  reason: string;
  mandateId: string;
};



export type RatingInstrumentCycle = {
  rcmId: string;
  instrumentId: string;
  instrumentDetailId: string;
  cycleStatus: 'C' | 'A'; // Completed or Active
  cycleStartDate: string;
  meetingType: 'Internal' | 'External';
  meetingDate: string;
  rating: string;
  ratingAction: string;
  instrumentSize: number;
  outstandingAmount: number;
};

export type LatestBankDetail = {
  id: string; // Running Instrument ID
  bankLender: string;
  instrument: string;
  ratedAmount: number;
  foreignCurrAmount: number;
  currency: string;
  debtRepaymentTerms: string;
  remark: string;
};

export type BankerLenderDetail = {
  id: string;
  bankName: string;
  ratedAmount: number;
  currencyType: string;
  ratedAmountForeign?: number;
  repaymentTerms: string;
  remarks: string;
  status: 'Pending' | 'Verified by GH';
};

export type ISINRecord = {
  id: string;
  isin: string;
  type: string;
  status: string;
  issueType: string;
  listedOn: string;
  issuanceDate?: string | Date | null;
  couponRate?: number | null;
  maturityDate?: string | Date | null;
  redemptionDate?: string | Date | null;
  issueAmount?: number | null;
  outstandingAmount?: number | null;
};


export type AnnexureVHistory = {
  id: string; // Running Instrument ID
  instrument: string;
  status: 'Active' | 'Withdrawn' | 'Closed';
  amount: number;
  count: number;
  initialRatingDate: string;
  initialRating: string;
  ratingActions: {
    date: string;
    rating: string;
  }[];
};

export type RatingInstrument = {
  id: string; // Running Ins. ID
  instrumentStatus: 'Active' | 'Withdrawn';
  groupHead: string;
  ratingAnalyst: string;
  client: string;
  mandateId: string;
  mandateDate: string;
  mandateStatus: string;
  instrumentId: number;
  category: string;
  subCategory: string;
  instrument: string;
  complexityLevel: 'Simple' | 'Complex' | 'Highly Complex';
  instrumentSize: number; // in Lacs
  couponRate?: string;
  issuanceDate?: string;
  maturityDate?: string;
  placedDate?: string;
  instrumentDetail?: string;
  remarks?: string;
  initialRatingDate?: string;
  accountManager?: string;
  cycleHistory: RatingInstrumentCycle[];
  isinRecords?: ISINRecord[];
  bankerLenderDetails?: Record<string, BankerLenderDetail[]>;
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

export interface MandateInstrument {
    instrumentId: string;
    category: string;
    subCategory: string;
    instrumentName: string;
    instrumentAmt: number;
    enhanceReduce: number;
    totalInstrumentSize: number;
    agendaType: 'Initial' | 'Surveillance' | 'Withdrawal';
    isSelected: boolean;
}

export interface Mandate {
    mandateId: string;
    targetDate: string;
    primaryAnalyst: string;
    ratingCycle: 'Initial' | 'Surveillance';
    instruments: MandateInstrument[];
    isSelected: boolean;
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
  editorContent?: string; // The SFDT content of the Syncfusion editor
  prContent?: string; // Press Release content as JSON string
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
