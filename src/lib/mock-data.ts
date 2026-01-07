





import type { CKCRequest, AppUser, Role, RequestStatus, CompanyInfo, RatingNote, NoteStatus, RatingNoteDataSchema, DTFirm, DTContact, FeedbackStatus, QuestionnaireItem, IPAFirm, IPAContact, ThirdParty, AuditCommitteeMeeting, SiteVisit, AuditorFirm, AuditorContact, BankerFirm, BankerContact } from './definitions';


// --- FSD-based Master JSON Data Structure ---

const getMasterRatingNoteData = (noteId: string, companyName: string): RatingNoteDataSchema => ({
  documentMeta: {
    templateId: "RATING_NOTE_PHARMA_V1",
    templateVersion: "1.0",
    sector: "PHARMA",
    totalPagesExpected: 41,
    sfdtStoragePath: "templates/pharma_rating_note_v1.sfdt", // Simulated path
    language: "en-IN",
    currency: "INR",
    unit: "Crore"
  },
  workflowContext: {
    mandateId: noteId.replace('NOTE', 'MAND'),
    ratingType: "Surveillance",
    committeeDate: "2026-01-15",
    currentStage: "RATING_ANALYST",
    status: "IN_PROGRESS"
  },
  dataBindings: {
    company: {
      name: companyName,
      cin: "L24230MH2001PLC123456",
      incorporationDate: "2001-04-12",
      natureOfBusiness: "Pharmaceutical Formulations and APIs",
      groupName: `${companyName} Group`,
      registeredOffice: "Mumbai, Maharashtra",
      website: `www.${companyName.toLowerCase().replace(/ /g, '')}.com`
    },
    management: {
      ceo: "Mr. Rajesh Mehta",
      cfo: "Ms. Neha Sharma",
      chairman: "Mr. Suresh Mehta",
      companySecretary: "Ms. Pooja Jain",
      employees: 1850
    },
    rating: {
      recommendedLongTerm: "CARE AA-; Stable",
      recommendedShortTerm: "CARE A1+",
      finalRating: "",
      unsupportedRatings: "Nil",
      absenceOfPendingDocs: "Yes",
    },
    analyst: {
      analyst1: "Abhay Baghel",
      analyst2: "Ankit Verma",
      groupHead: "Sanjay Khanna",
      ratingHead: "R. Narayanan"
    }
  },
  tables: {
    manufacturingFacilities: {
      sfdtTableId: "TABLE_MFG_FACILITIES",
      repeatable: true,
      columns: ["location", "productSegment", "regulatoryApproval", "lastAudit"],
      rows: [
        { "location": "Ahmedabad, Gujarat", "productSegment": "Formulation (Oral Solid Dosage)", "regulatoryApproval": "USFDA", "lastAudit": "Oct-23" },
        { "location": "Vapi, Gujarat", "productSegment": "API", "regulatoryApproval": "USFDA", "lastAudit": "Jun-23" }
      ]
    },
    geographySales: {
      sfdtTableId: "TABLE_GEO_SALES",
      financialYearScoped: true,
      rows: [
        { "region": "Domestic", "FY22": 1926, "FY23": 2063, "FY24": 2200, "shareFY24": 44 },
        { "region": "Export", "FY22": 2441, "FY23": 2424, "FY24": 2782, "shareFY24": 56 }
      ]
    },
    financials: {
        sfdtTableId: "TABLE_FINANCIALS",
        years: ["FY22", "FY23", "FY24", "FY25P"],
        metrics: {
          "totalIncome": [4367, 4487, 4982, 5200],
          "pbidlt": [780, 810, 890, 920],
          "pat": [320, 340, 385, 410],
          "totalDebt": [2100, 2250, 2380, 2400]
        }
    }
  },
  permissions: {
    "RATING_ANALYST": { "editableSections": ["company", "financials", "rationale", "tables"] },
    "GROUP_HEAD": { "editableSections": ["rating.finalRating", "rating.deviationComment"] },
    "QC": { "editableSections": ["qcComments"] },
    "OTHERS": { "readOnly": true }
  },
  audit: {
    version: 1,
    lastSavedBy: "System",
    lastSavedRole: "SYSTEM",
    lastSavedAt: new Date().toISOString(),
    changeSummary: "Initial creation"
  },
  editorContent: "" // Start with empty editor content
});


let ratingNotes: RatingNote[] = [
    { 
        id: 'NOTE-001', 
        companyName: 'Sun Pharmaceutical Industries Limited', 
        companyId: 'COMP-101',
        ratingCycle: 'Initial', 
        priority: 'High', 
        dueDate: '1 Jan 26', 
        status: 'Completed',
        currentActor: 'SYSTEM',
        initiatedBy: 'rating.analyst@careedge',
        ghId: 'group.head@careedge',
        qcId: 'qc@careedge.com',
        ccId: 'cc@careedge.com',
        editorContent: '',
        statusHistory: [
            { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
            { status: 'In Review (GH)', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
            { status: 'In Review (QC)', timestamp: new Date().toISOString(), actorId: 'group.head@careedge' },
            { status: 'QC Approved', timestamp: new Date().toISOString(), actorId: 'qc@careedge.com' },
            { status: 'In Review (CC)', timestamp: new Date().toISOString(), actorId: 'group.head@careedge' },
            { status: 'CC Approved', timestamp: new Date().toISOString(), actorId: 'cc@careedge.com' },
            { status: 'Completed', timestamp: new Date().toISOString(), actorId: 'group.head@careedge' },
        ],
        ratingNoteData: getMasterRatingNoteData('NOTE-001', 'Sun Pharmaceutical Industries Limited')
    },
    { 
        id: 'NOTE-002', 
        companyName: 'Dr. Reddy’s Laboratories Limited', 
        companyId: 'COMP-102',
        ratingCycle: 'Surveillance', 
        priority: 'Medium', 
        dueDate: '3 Feb 26', 
        status: 'Draft',
        currentActor: 'RATING_ANALYST',
        initiatedBy: 'rating.analyst@careedge',
        editorContent: '',
        statusHistory: [
            { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' }
        ],
        ratingNoteData: getMasterRatingNoteData('NOTE-002', 'Dr. Reddy’s Laboratories Limited')
    },
    { 
        id: 'NOTE-003', 
        companyName: 'Cipla Limited', 
        companyId: 'COMP-103',
        ratingCycle: 'Initial', 
        priority: 'Low', 
        dueDate: '10 Mar 26', 
        status: 'In Review (GH)',
        currentActor: 'GROUP_HEAD',
        initiatedBy: 'rating.analyst@careedge',
        ghId: 'group.head@careedge',
        editorContent: '',
        statusHistory: [
             { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
             { status: 'In Review (GH)', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' }
        ],
        ratingNoteData: getMasterRatingNoteData('NOTE-003', 'Cipla Limited')
    },
];

let requests: CKCRequest[] = [
  {
    id: 'REQ-001',
    requestId: 'REQ-001',
    companyId: 'COMP-101',
    companyName: 'Reliance Industries',
    financialInputSector: 'Pharma',
    listed: 'Yes',
    rating: 'AAA',
    hoRoName: 'Mumbai HO',
    dealingAnalyst: 'Analyst A',
    groupHead: 'Head 1',
    status: 'PENDING',
    cycle: 'Initial',
    auditedFY: ['2023'],
    provisionalFY: ['2024'],
    projectionFY: [],
    remarks: 'Initial request for FY23.',
    receiptDateTime: '2024-05-01T10:00:00Z',
    createdBy: 'Initiator 1',
    resultType: 'Standalone',
    currentOwnerId: null,
    currentOwnerRole: null,
    assignedCheckerId: 'checker-001',
    statusHistory: [
        { status: 'PENDING', timestamp: '2024-05-01T10:00:00Z', actorId: 'system', actorRole: 'SYSTEM' }
    ],
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    overallStatus: 'Pending',
    itemType: 'Request',
    path: '/requests/REQ-001',
    assignedTo: null,
    checker: 'checker-001'
  },
  {
    id: 'REQ-002',
    requestId: 'REQ-002',
    companyId: 'COMP-102',
    companyName: 'Tata Consultancy Services',
    financialInputSector: 'IT',
    listed: 'Yes',
    rating: 'AA+',
    hoRoName: 'Bangalore RO',
    dealingAnalyst: 'Analyst B',
    groupHead: 'Head 2',
    status: 'IN_PROGRESS',
    cycle: 'Surveillance',
    auditedFY: ['2022', '2023'],
    provisionalFY: [],
    projectionFY: [],
    remarks: 'Surveillance for FY22-23.',
    receiptDateTime: '2024-05-02T11:30:00Z',
    createdBy: 'Initiator 2',
    resultType: 'Consolidated',
    currentOwnerId: 'mock-user-123',
    currentOwnerRole: 'CKC_ANALYST',
    assignedCheckerId: 'checker-001',
    statusHistory: [
        { status: 'PENDING', timestamp: '2024-05-02T11:30:00Z', actorId: 'system', actorRole: 'SYSTEM' },
        { status: 'ACCEPTED', timestamp: '2024-05-02T14:00:00Z', actorId: 'mock-user-123', actorRole: 'CKC_ANALYST' },
        { status: 'IN_PROGRESS', timestamp: '2024-05-02T14:05:00Z', actorId: 'mock-user-123', actorRole: 'CKC_ANALYST' }
    ],
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    overallStatus: 'In Progress',
    itemType: 'Request',
    path: '/requests/REQ-002',
    assignedTo: 'mock-user-123',
    ckcAnalystName: 'CKC Analyst',
    checker: 'checker-001'
  },
  {
    id: 'REQ-003',
    requestId: 'REQ-003',
    companyId: 'COMP-103',
    companyName: 'HDFC Bank',
    financialInputSector: 'Banking',
    listed: 'Yes',
    rating: 'AAA',
    hoRoName: 'Delhi HO',
    dealingAnalyst: 'Analyst C',
    groupHead: 'Head 1',
    status: 'APPROVED',
    cycle: 'Initial',
    auditedFY: ['2023'],
    provisionalFY: [],
    projectionFY: [],
    remarks: 'Approved by checker.',
    receiptDateTime: '2024-04-15T09:00:00Z',
    createdBy: 'Initiator 3',
    resultType: 'Standalone',
    currentOwnerId: 'checker-001',
    currentOwnerRole: 'CKC_CHECKER',
     assignedCheckerId: 'checker-001',
    statusHistory: [
        { status: 'PENDING', timestamp: '2024-04-15T09:00:00Z', actorId: 'system', actorRole: 'SYSTEM' },
        { status: 'ACCEPTED', timestamp: '2024-04-15T10:00:00Z', actorId: 'analyst-002', actorRole: 'CKC_ANALYST' },
        { status: 'IN_PROGRESS', timestamp: '2024-04-15T10:05:00Z', actorId: 'analyst-002', actorRole: 'CKC_ANALYST' },
        { status: 'SUBMITTED_FOR_CHECK', timestamp: '2024-04-20T17:00:00Z', actorId: 'analyst-002', actorRole: 'CKC_ANALYST' },
        { status: 'APPROVED', timestamp: '2024-04-25T18:00:00Z', actorId: 'checker-001', actorRole: 'CKC_CHECKER' }
    ],
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    overallStatus: 'Approved',
    itemType: 'Request',
    path: '/requests/REQ-003',
    assignedTo: 'analyst-002',
    checker: 'checker-001'
  },
  {
    id: 'REQ-004',
    requestId: 'REQ-004',
    companyId: 'COMP-104',
    companyName: 'Infosys',
    financialInputSector: 'IT',
    listed: 'Yes',
    rating: 'AAA',
    hoRoName: 'Bangalore RO',
    dealingAnalyst: 'Analyst D',
    groupHead: 'Head 2',
    status: 'PENDING',
    cycle: 'Surveillance',
    auditedFY: ['2023'],
    provisionalFY: [],
    projectionFY: [],
    remarks: 'Annual surveillance.',
    receiptDateTime: '2024-05-10T14:00:00Z',
    createdBy: 'Initiator 1',
    resultType: 'Consolidated',
    currentOwnerId: null,
    currentOwnerRole: null,
    assignedCheckerId: 'checker-002',
    statusHistory: [
        { status: 'PENDING', timestamp: '2024-05-10T14:00:00Z', actorId: 'system', actorRole: 'SYSTEM' }
    ],
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    overallStatus: 'Pending',
    itemType: 'Request',
    path: '/requests/REQ-004',
    assignedTo: null,
    checker: 'checker-002'
  },
   {
    id: 'REQ-005',
    requestId: 'REQ-005',
    companyId: 'COMP-105',
    companyName: 'Sun Pharmaceutical',
    financialInputSector: 'Pharma',
    listed: 'Yes',
    rating: 'AA-',
    hoRoName: 'Mumbai HO',
    dealingAnalyst: 'Analyst E',
    groupHead: 'Head 1',
    status: 'CLOSED',
    cycle: 'Initial',
    auditedFY: ['2023'],
    provisionalFY: [],
    projectionFY: [],
    remarks: 'Closed request.',
    receiptDateTime: '2024-03-01T10:00:00Z',
    checkingCompletedDateTime: '2024-03-15T18:00:00Z',
    createdBy: 'Initiator 3',
    resultType: 'Standalone',
    currentOwnerId: 'system',
    currentOwnerRole: 'SYSTEM',
     assignedCheckerId: 'checker-001',
    statusHistory: [],
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    sentBackFlag: false,
    overallStatus: 'Completed',
    itemType: 'Request',
    path: '/requests/REQ-005',
    assignedTo: 'analyst-002',
    ckcAnalystName: 'CKC Analyst 2',
    checker: 'checker-001'
  },
];


let operationalInputData: Record<string, any> = {
    'REQ-002': {
        id: 'REQ-002',
        status: 'IN_PROGRESS',
        currentOwnerId: 'mock-user-123',
        currentOwnerRole: 'CKC_ANALYST',
        initiation: {
            companyName: 'Tata Consultancy Services',
            approach: 'Consolidated',
            period: '2023-24',
            amountScale: 'Crores',
            currency: 'INR'
        },
        basic_info: {
            cin: 'L85110KA1981PLC004514',
            yearOfIncorporation: 1981,
            authorizedCapital: 2000,
            paidUpCapital: 1850
        },
    }
};

export let auditCommitteeMeetings: Record<string, AuditCommitteeMeeting> = {};
export let siteVisitData: Record<string, SiteVisit> = {};

export const mockUsers: Record<string, AppUser> = {
    'rating.analyst@careedge': {
        uid: 'rating.analyst@careedge',
        email: 'analyst@careedge.com',
        displayName: 'Taha G',
        role: 'RATING_ANALYST',
        photoURL: 'https://i.pravatar.cc/150?u=taha'
    },
     'group.head@careedge': {
        uid: 'group.head@careedge',
        email: 'group.head@careedge.com',
        displayName: 'Group Head',
        role: 'GROUP_HEAD',
        photoURL: 'https://i.pravatar.cc/150?u=gh'
    },
};

export const mockCompanies = [
    { id: 'COMP-101', companyName: 'Sun Pharmaceutical Industries Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-102', companyName: 'Dr. Reddy’s Laboratories Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-103', companyName: 'Cipla Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-104', companyName: 'Lupin Limited', ratingAnalystId: 'another.analyst', groupHeadId: 'another.gh' },
    { id: 'COMP-105', companyName: 'Aurobindo Pharma Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-106', companyName: 'Glenmark Pharmaceuticals Limited', ratingAnalystId: 'another.analyst', groupHeadId: 'group.head@careedge' },
];

export const mockThirdParties: ThirdParty[] = [
    {
        id: 'TP-001',
        name: 'Global Logistics Inc.',
        relationship: 'Logistics Partner',
        contacts: [
            { id: 'TPC-001', name: 'Sarah Chen', designation: 'Operations Head', email: 'sarah.c@globallogistics.com', isPrimary: true },
            { id: 'TPC-002', name: 'Mike Ross', designation: 'Account Manager', email: 'mike.r@globallogistics.com' },
        ]
    },
    {
        id: 'TP-002',
        name: 'Innovate Solutions Ltd.',
        relationship: 'Technology Vendor',
        contacts: [
            { id: 'TPC-003', name: 'David Lee', designation: 'CTO', email: 'david.l@innovatesolutions.com', isPrimary: true },
        ]
    }
];

export const mockTemplates = [
    { id: 'template-001', name: 'Standard Corporate Rating Template' },
    { id: 'template-002', name: 'Bank Rating Template' },
    { id: 'template-003', name: 'Infrastructure Project Rating Template' },
];

export const mockCriteria = [
    { id: 'criteria-001', name: 'Criteria for Rating Manufacturing Companies' },
    { id: 'criteria-002', name: 'Criteria for Rating Service Sector Companies' },
    { id: 'criteria-003', name: 'Criteria for Bank Loans' },
    { id: 'criteria-004', name: 'Parent and Group Support' },
];

let auditorFeedbackData: Record<string, AuditorFirm[]> = {
    'COMP-101': [
        {
            id: 'AUDF-001',
            firmName: 'A.U. Mojad & Associates',
            contacts: [
                { id: 'AUDC-001', name: 'A.U. Mojad', email: 'au.mojad@example.com', contact: '9123456780', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null },
            ]
        },
         {
            id: 'AUDF-002',
            firmName: 'Ashish R Pai & Associates',
            contacts: [
                { id: 'AUDC-002', name: 'Ashish R Pai', email: 'ashish.pai@example.com', contact: '9123456781', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null },
            ]
        }
    ]
};

let bankerFeedbackData: Record<string, BankerFirm[]> = {
     'COMP-101': [
        {
            id: 'BANKF-001',
            firmName: 'HDFC Bank',
            contacts: [
                { id: 'BANKC-001', name: 'Priya Sharma', email: 'priya.sharma@hdfc.com', contact: '9876543210', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null },
            ]
        },
    ]
};

let dtFeedbackData: Record<string, DTFirm[]> = {
    'COMP-101': [
        {
            id: 'DTF-001',
            firmName: 'ABC Associates',
            contacts: [
                { id: 'DTC-001', name: 'John Doe', email: 'john.doe@abcfirm.com', contact: '9876543210', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null, questionnaire: [], summary: '' },
                { id: 'DTC-002', name: 'Jane Smith', email: 'jane.smith@abcfirm.com', contact: '8765432109', discussionHappened: 'Yes', minutesCaptured: 'Partial', minutesCapturedOn: new Date().toISOString(), status: 'In Progress', questionnaire: [], summary: 'Summary of discussion with Jane.' },
            ]
        },
         {
            id: 'DTF-002',
            firmName: 'PR Firm',
            contacts: [
                { id: 'DTC-003', name: 'Peter Jones', email: 'peter.jones@prfirm.com', contact: '7654321098', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null, questionnaire: [], summary: '' },
            ]
        }
    ],
    'COMP-102': [
        {
            id: 'DTF-003',
            firmName: 'New India Associates',
            contacts: [
                 { id: 'DTC-004', name: 'Sam Wilson', email: 'sam.wilson@newindia.com', contact: '6543210987', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null, questionnaire: [], summary: '' },
            ]
        }
    ]
};

let ipaFeedbackData: Record<string, IPAFirm[]> = {
    'COMP-101': [
        {
            id: 'IPAF-001',
            firmName: 'SDK & PR Associates',
            contacts: [
                { id: 'IPAC-001', name: 'Anish Kumar', email: 'anish.k@sdkpr.com', contact: '9876543211', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null, questionnaire: [], summary: '' },
            ]
        },
    ],
     'COMP-102': [
        {
            id: 'IPAF-002',
            firmName: 'Nelson and Co.',
            contacts: [
                 { id: 'IPAC-002', name: 'Priya Sharma', email: 'priya.s@nelson.com', contact: '6543210988', discussionHappened: '', minutesCaptured: 'No', minutesCapturedOn: null, status: null, questionnaire: [], summary: '' },
            ]
        }
    ]
};


let companyInfoData: Record<string, CompanyInfo> = {
    'COMP-101': {
        masterSnapshot: {
            name: 'Sun Pharmaceutical Industries Limited',
            address: '123 Maker Towers',
            city: 'Mumbai',
            zipCode: '400021',
            state: 'Maharashtra',
            country: 'India',
            listingStatus: 'Listed',
            listingIn: 'BSE, NSE',
            macroEconomicIndicator: 'Normal',
            sector: 'Pharmaceuticals',
            industry: 'Generic API',
            basicIndustry: 'API Manufacturing'
        },
        groupSelection: {
            group: 'Sun Pharma Group',
            groupForCombinedApproach: ''
        },
        contactDetails: [],
        auditorDetails: [
             { id: 'AUD-001', firmName: 'A.U. Mojad & Associates', contactPerson: 'A.U. Mojad', emailId: 'au.mojad@example.com', contactNo: '9123456780' },
             { id: 'AUD-002', firmName: 'Ashish R Pai & Associates', contactPerson: 'Ashish R Pai', emailId: 'ashish.pai@example.com', contactNo: '9123456781' },
        ],
        bankerDetails: [
             { id: 'BANK-001', firmName: 'HDFC Bank', contactPerson: 'Priya Sharma', emailId: 'priya.sharma@hdfc.com', contactNo: '9876543210' }
        ],
        dtDetails: [
            { id: 'DT-001', firmName: 'ABC Associates', contactPerson: 'John Doe', emailId: 'john.doe@abcfirm.com', contactNo: '9876543210' },
            { id: 'DT-002', firmName: 'ABC Associates', contactPerson: 'Jane Smith', emailId: 'jane.smith@abcfirm.com', contactNo: '8765432109' },
            { id: 'DT-003', firmName: 'PR Firm', contactPerson: 'Peter Jones', emailId: 'peter.jones@prfirm.com', contactNo: '7654321098' },
        ],
        ipaDetails: [
             { id: 'IPA-001', firmName: 'SDK & PR Associates', contactPerson: 'Anish Kumar', emailId: 'anish.k@sdkpr.com', contactNo: '9876543211' },
             { id: 'IPA-002', firmName: 'Nelson and Co.', contactPerson: 'Priya Sharma', emailId: 'priya.s@nelson.com', contactNo: '6543210988' },
        ],
        thirdPartyDetails: [],
        syncStatus: {
            source: 'CRM',
            lastUpdatedBy: 'crm-system',
            lastUpdatedAt: new Date().toISOString()
        }
    }
};

// --- New Rating Note Data Functions ---

export const getCompaniesByRole = (user: AppUser | null) => {
    if (!user) return [];
    // Simplified logic for prototype
    switch (user.role) {
        case 'RATING_ANALYST':
            return mockCompanies.filter(c => c.ratingAnalystId === user.uid);
        case 'GROUP_HEAD':
            // GH sees companies of their RAs
            const raIdsForGh = mockCompanies
                .filter(c => c.groupHeadId === user.uid)
                .map(c => c.ratingAnalystId);
            return mockCompanies.filter(c => raIdsForGh.includes(c.ratingAnalystId));
        case 'RATING_HEAD_SD':
             return mockCompanies; // RH sees all companies
        default:
            return mockCompanies;
    }
};

export const getAuditorFeedbackByCompanyId = (companyId: string): AuditorFirm[] => {
    const firms = auditorFeedbackData[companyId] || [];
    return firms.map(firm => ({
        ...firm,
        contacts: firm.contacts.map(c => ({...c, status: c.status || null}))
    }));
}

export const getBankerFeedbackByCompanyId = (companyId: string): BankerFirm[] => {
    const firms = bankerFeedbackData[companyId] || [];
    return firms.map(firm => ({
        ...firm,
        contacts: firm.contacts.map(c => ({...c, status: c.status || null}))
    }));
}

export const getDTFeedbackByCompanyId = (companyId: string): DTFirm[] => {
    const firms = dtFeedbackData[companyId] || [];
    // Ensure all contacts have a non-null status for filtering
    return firms.map(firm => ({
        ...firm,
        contacts: firm.contacts.map(c => ({...c, status: c.status || null}))
    }));
}

export const getIPAFeedbackByCompanyId = (companyId: string): IPAFirm[] => {
    const firms = ipaFeedbackData[companyId] || [];
    return firms.map(firm => ({
        ...firm,
        contacts: firm.contacts.map(c => ({...c, status: c.status || null}))
    }));
}

export const getAuditorFeedbackByContactId = (companyId: string, firmId: string, contactId: string): { firm: AuditorFirm, contact: AuditorContact } | null => {
    const firm = auditorFeedbackData[companyId]?.find(f => f.id === firmId);
    if (firm) {
        const contact = firm.contacts.find(c => c.id === contactId);
        if (contact) {
            return { firm: JSON.parse(JSON.stringify(firm)), contact: JSON.parse(JSON.stringify(contact)) };
        }
    }
    return null;
}
export const getBankerFeedbackByContactId = (companyId: string, firmId: string, contactId: string): { firm: BankerFirm, contact: BankerContact } | null => {
    const firm = bankerFeedbackData[companyId]?.find(f => f.id === firmId);
    if (firm) {
        const contact = firm.contacts.find(c => c.id === contactId);
        if (contact) {
            return { firm: JSON.parse(JSON.stringify(firm)), contact: JSON.parse(JSON.stringify(contact)) };
        }
    }
    return null;
}

export const getDTFeedbackByContactId = (companyId: string, firmId: string, contactId: string): { firm: DTFirm, contact: DTContact } | null => {
    const firm = dtFeedbackData[companyId]?.find(f => f.id === firmId);
    if (firm) {
        const contact = firm.contacts.find(c => c.id === contactId);
        if (contact) {
            return { firm: JSON.parse(JSON.stringify(firm)), contact: JSON.parse(JSON.stringify(contact)) };
        }
    }
    return null;
}

export const getIPAFeedbackByContactId = (companyId: string, firmId: string, contactId: string): { firm: IPAFirm, contact: IPAContact } | null => {
    const firm = ipaFeedbackData[companyId]?.find(f => f.id === firmId);
    if (firm) {
        const contact = firm.contacts.find(c => c.id === contactId);
        if (contact) {
            return { firm: JSON.parse(JSON.stringify(firm)), contact: JSON.parse(JSON.stringify(contact)) };
        }
    }
    return null;
}

export const createAuditorRecord = (companyId: string, firmId: string, contactId: string, discussionHappened: 'Yes' | 'No') => {
    const firm = auditorFeedbackData[companyId]?.find(f => f.id === firmId);
    if (!firm) return null;
    
    const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return null;

    const updatedContact = {
        ...firm.contacts[contactIndex],
        discussionHappened: discussionHappened,
        status: 'Pending' as FeedbackStatus,
        minutesCapturedOn: new Date().toISOString()
    };
    
    firm.contacts[contactIndex] = updatedContact;
    
    return updatedContact;
};

export const createBankerRecord = (companyId: string, firmId: string, contactId: string, discussionHappened: 'Yes' | 'No') => {
    const firm = bankerFeedbackData[companyId]?.find(f => f.id === firmId);
    if (!firm) return null;
    
    const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return null;

    const updatedContact = {
        ...firm.contacts[contactIndex],
        discussionHappened: discussionHappened,
        status: 'Pending' as FeedbackStatus,
        minutesCapturedOn: new Date().toISOString()
    };
    
    firm.contacts[contactIndex] = updatedContact;
    
    return updatedContact;
};


export const createDTRecord = (companyId: string, firmId: string, contactId: string, discussionHappened: 'Yes' | 'No') => {
    const firm = dtFeedbackData[companyId]?.find(f => f.id === firmId);
    if (!firm) return null;
    
    const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return null;

    const updatedContact = {
        ...firm.contacts[contactIndex],
        discussionHappened: discussionHappened,
        status: 'Pending' as FeedbackStatus,
        minutesCapturedOn: new Date().toISOString()
    };
    
    firm.contacts[contactIndex] = updatedContact;
    
    return updatedContact;
};

export const createIPARecord = (companyId: string, firmId: string, contactId: string, discussionHappened: 'Yes' | 'No') => {
    const firm = ipaFeedbackData[companyId]?.find(f => f.id === firmId);
    if (!firm) return null;
    
    const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return null;

    const updatedContact = {
        ...firm.contacts[contactIndex],
        discussionHappened: discussionHappened,
        status: 'Pending' as FeedbackStatus,
        minutesCapturedOn: new Date().toISOString()
    };
    
    firm.contacts[contactIndex] = updatedContact;
    
    return updatedContact;
};

const commonFeedbackUpdate = (contact: any, updates: any) => {
    const updatedContact = { ...contact, ...updates };

    if (updates.status === 'Completed') {
        updatedContact.minutesCaptured = 'Yes';
    } else if (updates.summary || (updates.questionnaire && updates.questionnaire.some((q: any) => q.remarks))) {
        updatedContact.status = 'In Progress';
        updatedContact.minutesCaptured = 'Partial';
    } else if (updates.discussionHappened === 'No') {
         updatedContact.status = 'In Progress';
         updatedContact.minutesCaptured = 'No';
    }

    if (!updatedContact.minutesCapturedOn && (updatedContact.minutesCaptured === 'Partial' || updatedContact.minutesCaptured === 'Yes')) {
        updatedContact.minutesCapturedOn = new Date().toISOString();
    }
    return updatedContact;
}

export const updateAuditorFeedback = (companyId: string, firmId: string, contactId: string, updates: Partial<AuditorContact>) => {
    const firm = auditorFeedbackData[companyId]?.find(f => f.id === firmId);
    if (firm) {
        const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
            firm.contacts[contactIndex] = commonFeedbackUpdate(firm.contacts[contactIndex], updates);
            return firm.contacts[contactIndex];
        }
    }
    return null;
}

export const updateBankerFeedback = (companyId: string, firmId: string, contactId: string, updates: Partial<BankerContact>) => {
    const firm = bankerFeedbackData[companyId]?.find(f => f.id === firmId);
    if (firm) {
        const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
            firm.contacts[contactIndex] = commonFeedbackUpdate(firm.contacts[contactIndex], updates);
            return firm.contacts[contactIndex];
        }
    }
    return null;
}


export const updateDTFeedback = (companyId: string, firmId: string, contactId: string, updates: Partial<DTContact>) => {
    const firms = dtFeedbackData[companyId];
    if (firms) {
        const firm = firms.find(f => f.id === firmId);
        if (firm) {
            const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
            if (contactIndex !== -1) {
                firm.contacts[contactIndex] = commonFeedbackUpdate(firm.contacts[contactIndex], updates);
                return firm.contacts[contactIndex];
            }
        }
    }
    return null;
};


export const updateIPAFeedback = (companyId: string, firmId: string, contactId: string, updates: Partial<IPAContact>) => {
    const firms = ipaFeedbackData[companyId];
    if (firms) {
        const firm = firms.find(f => f.id === firmId);
        if (firm) {
            const contactIndex = firm.contacts.findIndex(c => c.id === contactId);
            if (contactIndex !== -1) {
                firm.contacts[contactIndex] = commonFeedbackUpdate(firm.contacts[contactIndex], updates);
                return firm.contacts[contactIndex];
            }
        }
    }
    return null;
};


export const getNotesByRole = (role: Role, userId: string): RatingNote[] => {
    if (!userId) return [];
    switch(role) {
        case 'RATING_ANALYST':
            // RA sees all notes they initiated, regardless of current actor
            return ratingNotes.filter(note => note.initiatedBy === userId);
        case 'GROUP_HEAD':
        case 'QC':
        case 'RATING_COMMITTEE':
             // Other roles see notes only when they are the current actor
            return ratingNotes.filter(note => note.currentActor === role);
        default:
            // Admin-like roles can see everything
            return ['CKC_ADMIN', 'SYSTEM', 'RATING_HEAD_SD'].includes(role) ? ratingNotes : [];
    }
}

export const getNoteById = (id: string): RatingNote | undefined => {
  const note = ratingNotes.find(r => r.id === id);
  if (!note) return undefined;

  // If the note doesn't have the new data structure, create it on the fly
  if (!note.ratingNoteData) {
      note.ratingNoteData = getMasterRatingNoteData(note.id, note.companyName);
  }
  return note ? JSON.parse(JSON.stringify(note)) : undefined;
};

export const createNote = (body: Partial<RatingNote>): RatingNote => {
    const company = mockCompanies.find(c => c.id === body.companyId);
    if (!company) throw new Error("Company not found");

    const newNote: RatingNote = {
        id: `NOTE-${ratingNotes.length + 10}`,
        companyName: company.companyName,
        companyId: company.id,
        ratingCycle: 'Initial', // Defaulting
        priority: 'Medium', // Defaulting
        dueDate: '15 Jul 26', // Defaulting
        status: 'Draft',
        currentActor: 'RATING_ANALYST',
        initiatedBy: body.createdBy!,
        statusHistory: [{ status: 'Draft', actorId: body.createdBy!, timestamp: new Date().toISOString() }],
        ...body,
        ratingNoteData: getMasterRatingNoteData(`NOTE-${ratingNotes.length + 10}`, company.companyName),
    };

    ratingNotes.push(newNote);
    return JSON.parse(JSON.stringify(newNote));
}


export const updateNote = (id: string, updates: Partial<RatingNote>): RatingNote | null => {
    const noteIndex = ratingNotes.findIndex(r => r.id === id);
    if (noteIndex === -1) return null;
    
    // Ensure we're not overwriting the whole object, but merging updates
    const originalNote = ratingNotes[noteIndex];
    const updatedNote = { 
        ...originalNote, 
        ...updates,
        // If ratingNoteData is part of the update, merge it deeply
        ratingNoteData: updates.ratingNoteData 
            ? { ...originalNote.ratingNoteData, ...updates.ratingNoteData } as RatingNoteDataSchema
            : originalNote.ratingNoteData
    };

    if (updates.editorContent) {
        updatedNote.editorContent = updates.editorContent;
    }


    ratingNotes[noteIndex] = updatedNote;
    return JSON.parse(JSON.stringify(updatedNote));
}

export const updateNoteStatus = (id: string, newStatus: NoteStatus, actorId: string, editorContent?: string) => {
    const note = getNoteById(id);
    if (!note) return null;
    
    let updates: Partial<RatingNote> = {
        status: newStatus,
        statusHistory: [...note.statusHistory, { status: newStatus, timestamp: new Date().toISOString(), actorId }],
    };

    if (editorContent) {
        updates.editorContent = editorContent;
    }
    
    // Update currentActor based on the new status
    switch (newStatus) {
        case 'In Review (GH)':
            updates.currentActor = 'GROUP_HEAD';
            break;
        case 'In Review (QC)':
            updates.currentActor = 'QC';
            break;
        case 'In Review (CC)':
            updates.currentActor = 'RATING_COMMITTEE';
            break;
        case 'Rework Requested': // GH sends back to RA
             updates.currentActor = 'RATING_ANALYST';
             break;
        case 'QC Approved':
        case 'CC Approved':
        case 'Rework Requested (GH)': // QC or CC sends back to GH
            updates.currentActor = 'GROUP_HEAD';
            break;
        case 'Pending RR & PR (RA)':
            updates.currentActor = 'RATING_ANALYST';
            break;
         case 'In Final Review (GH)':
            updates.currentActor = 'GROUP_HEAD';
            break;
        case 'Draft':
             updates.currentActor = 'RATING_ANALYST';
             break;
        case 'Completed':
            updates.currentActor = 'SYSTEM';
            break;
    }
    
    return updateNote(id, updates);
};


// --- Old CKC Request Functions (can be deprecated later) ---

export const getRequests = (status?: string, id?: string) => {
  let filteredRequests = requests;
  if (status) {
    const statuses = Array.isArray(status) ? status : status.split(',');
    filteredRequests = filteredRequests.filter(r => statuses.includes(r.status));
  }
  if (id) {
    filteredRequests = filteredRequests.filter(r => r.id === id);
  }
  return JSON.parse(JSON.stringify(filteredRequests));
};


export const getRequestById = (id: string): CKCRequest | undefined => {
  const request = requests.find(r => r.id === id);
  return request ? JSON.parse(JSON.stringify(request)) : undefined;
};

const updateRequestStatus = (id: string, newStatus: RequestStatus, actor: AppUser, remarks?: string) => {
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) return null;

    const request = requests[requestIndex];
    
    request.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        actorId: actor.uid,
        actorRole: actor.role,
        remarks
    });

    request.status = newStatus;
    
    switch (newStatus) {
        case 'ACCEPTED':
            request.currentOwnerId = actor.uid;
            request.currentOwnerRole = 'CKC_ANALYST';
            request.assignedTo = actor.uid;
            request.ckcAnalystName = actor.displayName || actor.email || 'Unknown Analyst';
            request.entryAllottedDateTime = new Date().toISOString();
            break;
        case 'IN_PROGRESS':
             request.currentOwnerId = actor.uid;
             request.currentOwnerRole = 'CKC_ANALYST';
            break;
        case 'SUBMITTED_FOR_CHECK':
            request.currentOwnerId = request.assignedCheckerId;
            request.currentOwnerRole = 'CKC_CHECKER';
            request.entryCompletedDateTime = new Date().toISOString();
            request.checkingAllottedDateTime = new Date().toISOString();
            break;
        case 'SENT_BACK':
            const analystEntry = request.statusHistory.find(h => h.actorRole === 'CKC_ANALYST');
            request.currentOwnerId = analystEntry ? analystEntry.actorId : null;
            request.currentOwnerRole = 'CKC_ANALYST';
            request.sentBackFlag = true;
            break;
        case 'APPROVED':
            request.currentOwnerId = request.assignedCheckerId;
            request.currentOwnerRole = 'CKC_CHECKER';
            request.checkingCompletedDateTime = new Date().toISOString();
            break;
        case 'CLOSED':
             request.currentOwnerId = null;
             request.currentOwnerRole = 'SYSTEM';
             request.overallStatus = 'Completed';
             break;
    }
    
    requests[requestIndex] = request;
    return request;
}

export const acceptRequest = (requestId: string, userId: string, userName: string) => {
    const request = getRequestById(requestId);
    if (!request || request.status !== 'PENDING') {
        return null;
    }
    
    const user: AppUser = {
        uid: userId,
        role: 'CKC_ANALYST',
        displayName: userName
    };
    
    return updateRequestStatus(requestId, 'ACCEPTED', user);
};

export const initiateRequest = (id: string, user: AppUser) => {
    return updateRequestStatus(id, 'IN_PROGRESS', user);
}

export const submitForChecking = (id: string, user: AppUser) => {
    const operationalData = getOperationalInput(id);
    if(operationalData) {
        operationalData.status = 'SUBMITTED_FOR_CHECK';
        operationalData.currentOwnerId = operationalData.assignedCheckerId;
        operationalData.currentOwnerRole = 'CKC_CHECKER';
        saveOperationalInput(id, operationalData);
    }
    return updateRequestStatus(id, 'SUBMITTED_FOR_CHECK', user);
}

export const sendBackRequest = (id: string, user: AppUser, remarks: string) => {
    const operationalData = getOperationalInput(id);
    if (operationalData) {
        operationalData.status = 'SENT_BACK';
        const analystEntry = getRequestById(id)?.statusHistory.find(h => h.actorRole === 'CKC_ANALYST');
        operationalData.currentOwnerId = analystEntry ? analystEntry.actorId : null;
        operationalData.currentOwnerRole = 'CKC_ANALYST';
        saveOperationalInput(id, operationalData);
    }
    return updateRequestStatus(id, 'SENT_BACK', user, remarks);
}

export const approveRequest = (id: string, user: AppUser) => {
    const operationalData = getOperationalInput(id);
    if (operationalData) {
        operationalData.status = 'APPROVED';
        operationalData.currentOwnerId = user.uid;
        operationalData.currentOwnerRole = 'CKC_CHECKER';
        saveOperationalInput(id, operationalData);
    }
    
    const approvedRequest = updateRequestStatus(id, 'APPROVED', user);
    if(approvedRequest) {
        // Automatically move to CLOSED after approval
        const systemUser: AppUser = { uid: 'system', role: 'SYSTEM', displayName: 'System' };
        return updateRequestStatus(id, 'CLOSED', systemUser);
    }
    return null;
}


export const getOperationalInput = (id: string) => {
    return operationalInputData[id] ? JSON.parse(JSON.stringify(operationalInputData[id])) : null;
}

export const saveOperationalInput = (id: string, data: any) => {
    if (!operationalInputData[id]) {
        operationalInputData[id] = { id };
    }
    operationalInputData[id] = { ...operationalInputData[id], ...data };
    return operationalInputData[id];
}

// Company Info Mock Data
export const getCompanyInfo = (ratingCycleId: string): CompanyInfo | null => {
    
    const defaultData = {
        masterSnapshot: {
            name: 'Unknown Company',
            address: '123 Pharma Lane',
            city: 'Hyderabad',
            zipCode: '500081',
            state: 'Telangana',
            country: 'India',
            listingStatus: 'Listed',
            listingIn: 'BSE, NSE',
            macroEconomicIndicator: 'Normal',
            sector: 'Pharmaceuticals',
            industry: 'Generic API',
            basicIndustry: 'API Manufacturing'
        },
        groupSelection: {
            group: 'Pharma Group',
            groupForCombinedApproach: ''
        },
        contactDetails: [], auditorDetails: [], bankerDetails: [], dtDetails: [], ipaDetails: [], thirdPartyDetails: [],
        syncStatus: {
            source: 'CRM',
            lastUpdatedBy: 'crm-system',
            lastUpdatedAt: new Date().toISOString()
        }
    };
    return companyInfoData[ratingCycleId] ? JSON.parse(JSON.stringify(companyInfoData[ratingCycleId])) : defaultData;
}

export const saveCompanyInfo = (ratingCycleId: string, data: CompanyInfo): CompanyInfo => {
    companyInfoData[ratingCycleId] = data;
    return JSON.parse(JSON.stringify(data));
}
