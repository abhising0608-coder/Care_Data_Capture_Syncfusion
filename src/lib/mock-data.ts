





import type { AppUser, Role, RequestStatus, CKCRequest, CKCRequestDocument, CompanyInfo, RatingNote, NoteStatus, RatingNoteDataSchema, LatestBankDetail, AnnexureVHistory, PressReleaseHistoryEntry, PressReleaseHistory, DMSDocumentHistory, RatingInstrument, RatingInstrumentCycle, PortfolioActivity, Mandate, Auditor, AuditorDiscussion, AuditorQuestionnaireItem, Banker, BankerDiscussion, DTA, DTADiscussion, DtaQuestionnaireItem, IPA, IPADiscussion, IpaQuestionnaireItem, ManagementDiscussion, ThirdPartyDiscussion, AuditCommitteeDiscussion, SitePlantVisit, BankerLenderDetail, ISINRecord } from './definitions';


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

export const mockPortfolioActivities: { preCommittee: PortfolioActivity[], postCommittee: PortfolioActivity[] } = {
  preCommittee: [
    { id: 'act-01', name: 'Rating Model', status: 'In Progress', action: 'Rollback' },
    { id: 'act-02', name: 'Rating Note', status: 'Completed', action: 'Attach RN' },
    { id: 'act-03', name: 'Send Note to GH', status: 'Completed', action: 'Rollback' },
    { id: 'act-04', name: 'Send Note to RH/QC', status: 'Completed', action: 'Rollback' },
    { id: 'act-05', name: 'ML/TF', status: 'Completed', action: 'Rollback' },
    { id: 'act-06', name: 'Send note to Committee', status: 'Not Initiated', action: null },
  ],
  postCommittee: [
    { id: 'act-07', name: 'Rating Committee Minutes', status: 'Completed', action: null },
    { id: 'act-08', name: 'Provisional Communication/ Acceptance Letter', status: 'Completed', action: null },
    { id: 'act-09', name: 'Rating Letter', status: 'Completed', action: null },
    { id: 'act-10', name: 'Press Release', status: 'Completed', action: null },
    { id: 'act-11', name: 'Rating Rationale', status: 'Completed', action: null },
    { id: 'act-12', name: 'DMS', status: 'Completed', action: null },
    { id: 'act-13', name: 'Verify and Mark Case as Complete', status: 'Completed', action: null },
  ]
};



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
        editorContent: '',
        statusHistory: [
            { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
            { status: 'In Review (GH)', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
            { status: 'In Review (QC)', timestamp: new Date().toISOString(), actorId: 'group.head@careedge' },
            { status: 'Approved by QC', timestamp: new Date().toISOString(), actorId: 'qc@careedge.com' },
            { status: 'PR Generation Pending', timestamp: new Date().toISOString(), actorId: 'group.head@careedge' },
            { status: 'PR Generated', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
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
     { 
        id: 'STFCL-01', 
        companyName: 'Shriram Transport Finance Company Ltd (STFCL)', 
        companyId: 'COMP-104',
        ratingCycle: 'Surveillance', 
        priority: 'High', 
        dueDate: '20 Jul 26', 
        status: 'In Review (GH)',
        currentActor: 'GROUP_HEAD',
        initiatedBy: 'rating.analyst@careedge',
        ghId: 'group.head@careedge',
        editorContent: '',
        statusHistory: [
             { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
             { status: 'In Review (GH)', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' }
        ],
        ratingNoteData: getMasterRatingNoteData('STFCL-01', 'Shriram Transport Finance Company Ltd (STFCL)')
    },
];

let ratingInstruments: Record<string, RatingInstrument[]> = {
  'COMP-101': [
    {
      id: '109630',
      instrumentStatus: 'Active',
      groupHead: 'Akshay Dilip',
      ratingAnalyst: 'Naman Doshi',
      client: 'Shriram Transport Finance Ltd',
      mandateId: '2023-2024/20/64858',
      mandateDate: '2023-07-18',
      mandateStatus: '5901',
      instrumentId: 109630,
      category: 'Long Term',
      subCategory: 'Bank Facilities',
      instrument: 'Term Loan',
      complexityLevel: 'Simple',
      instrumentSize: 50000,
      initialRatingDate: '2021-01-15',
      accountManager: 'Priya Singh',
      cycleHistory: [
        {
          rcmId: '109630',
          instrumentId: '109630',
          instrumentDetailId: '604326',
          cycleStatus: 'C',
          cycleStartDate: '2023-08-16',
          meetingType: 'Internal',
          meetingDate: '2023-07-18',
          rating: 'CARE A1+',
          ratingAction: 'Assigned',
          instrumentSize: 30000.00,
          outstandingAmount: 30000.00,
        },
        {
          rcmId: '109631',
          instrumentId: '109630',
          instrumentDetailId: '604327',
          cycleStatus: 'C',
          cycleStartDate: '2022-08-16',
          meetingType: 'Internal',
          meetingDate: '2022-07-18',
          rating: 'CARE A1+',
          ratingAction: 'Reaffirmed',
          instrumentSize: 25000.00,
          outstandingAmount: 25000.00,
        }
      ]
    },
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `12363${i}`,
      instrumentStatus: 'Active' as 'Active' | 'Withdrawn',
      groupHead: 'Kiran Kumar',
      ratingAnalyst: 'Naman Doshi',
      client: 'Shriram Transport Finance Ltd',
      mandateId: '3996',
      mandateDate: '2009-08-03',
      mandateStatus: '5901',
      instrumentId: 12363,
      category: 'Short Term',
      subCategory: 'Commercial Paper',
      instrument: 'Commercial Paper',
      complexityLevel: 'Simple' as 'Simple' | 'Complex' | 'Highly Complex',
      instrumentSize: 20000,
      initialRatingDate: '2008-05-20',
      accountManager: 'Priya Singh',
      cycleHistory: [
         {
          rcmId: `12363${i}`,
          instrumentId: `12363${i}`,
          instrumentDetailId: `501${i}`,
          cycleStatus: 'A' as 'C' | 'A',
          cycleStartDate: '2023-09-01',
          meetingType: 'External' as 'Internal' | 'External',
          meetingDate: '2023-09-15',
          rating: 'CARE A1+',
          ratingAction: 'Reaffirmed',
          instrumentSize: 20000.00,
          outstandingAmount: 18000.00,
        },
      ]
    }))
  ]
};

const ckcRequestDocuments: CKCRequestDocument[] = [
    { id: 'doc1', docType: 'Audited FY', year: 'FY 19-20', fileName: 'AY 2020.pdf', valid: 'Yes' },
    { id: 'doc2', docType: 'Audited FY', year: 'FY 20-21', fileName: 'AY 2021.pdf', valid: 'Yes' },
    { id: 'doc3', docType: 'Audited FY', year: 'FY 21-22', fileName: 'AY 2022.pdf', valid: 'No' },
    { id: 'doc4', docType: 'Audited FY', year: 'FY 22-23', fileName: 'AY 2023.pdf', valid: 'Yes' },
    { id: 'doc5', docType: 'Audited FY', year: 'FY 23-24', fileName: 'AY 2024.pdf', valid: 'Yes' },
    { id: 'doc6', docType: 'Provisional FY', year: 'FY 24-25', fileName: 'PY 2025.pdf', valid: 'Yes' },
    { id: 'doc7', docType: 'Projection', year: 'FY 25-26', fileName: 'PJ 2026.xlsx', valid: 'Yes' },
];

let ckcRequests: CKCRequest[] = [
    { id: 'CE0001511', companyId: '112811', companyName: 'Shriram Financial Corporation Ltd', finInputSector: 'NBFC', listed: 'Yes', cycle: 'Initial', receivedDate: '2024-05-10', auditedFY: '2023', status: 'PENDING', resultType: 'Standalone', analystName: 'Krishna Kanth', groupHead: 'Anup Kumar', hoRoName: 'Mumbai', createdBy: 'Prefilled', documents: ckcRequestDocuments },
    { id: 'CE0001512', companyId: '21804', companyName: 'Reliance Industries Ltd', finInputSector: 'Manufacturing', listed: 'Yes', cycle: 'Initial', receivedDate: '2024-05-10', auditedFY: '2023', status: 'PENDING', resultType: 'Consolidated', documents: ckcRequestDocuments.slice(0,3) },
    { id: 'CE0001513', companyId: '11897', companyName: 'HDFC Bank Ltd', finInputSector: 'Bank', listed: 'Yes', cycle: 'Surveillance', receivedDate: '2024-05-11', auditedFY: '2023', status: 'ACCEPTED', subStatus: 'Not Allotted', analystName: 'John Doe', resultType: 'Standalone', documents: ckcRequestDocuments.slice(1,4) },
    { id: 'CE0001529', companyId: '218998', companyName: 'Bharti Airtel Ltd', finInputSector: 'Manufacturing', listed: 'Yes', cycle: 'Surveillance', receivedDate: '2024-05-12', auditedFY: '2023', status: 'PENDING', resultType: 'Consolidated', documents: ckcRequestDocuments.slice(2,5) },
    { id: 'CE0001543', companyId: '296742', companyName: 'Shriram Finance Ltd', finInputSector: 'NBFC', listed: 'Yes', cycle: 'Initial', receivedDate: '2024-05-13', auditedFY: '2023', status: 'REJECTED', rejectionDate: '2024-05-14', rejectionComments: 'Incomplete documentation', resultType: 'Standalone', documents: [] },
    { id: 'CE0001501', companyId: '09873', companyName: 'Bajaj Housing Finance Ltd', finInputSector: 'HFC', listed: 'Yes', cycle: 'Surveillance', receivedDate: '2024-05-14', auditedFY: '2023', status: 'CLOSED', closedDate: '2024-06-01', hoRoName: 'Subash Rao', resultType: 'Standalone', documents: [] },
    { id: 'CE0001555', companyId: '12564', companyName: 'LIC Housing Finance', finInputSector: 'HFC', listed: 'Yes', cycle: 'Initial', receivedDate: '2024-05-15', auditedFY: '2023', status: 'WITHDRAWN', withdrawalDate: '2024-05-16', withdrawalReason: 'Client request', resultType: 'Standalone', documents: [] },
    { id: 'CE0001567', companyId: '34567', companyName: 'Adani Enterprises', finInputSector: 'Manufacturing', listed: 'Yes', cycle: 'Surveillance', receivedDate: '2024-05-16', auditedFY: '2023', status: 'ON_HOLD', onHoldBy: 'CKC Admin', onHoldReason: 'Awaiting further clarification', onHoldDate: '2024-05-17', hoRoName: 'Anand S', analystName: 'Varun S', resultType: 'Consolidated', documents: [] },
    { id: 'CE0001568', companyId: '34568', companyName: 'Tata Steel', finInputSector: 'Manufacturing', listed: 'Yes', cycle: 'Initial', receivedDate: '2024-05-16', auditedFY: '2023', status: 'ON_HOLD', onHoldBy: 'CKC Admin', onHoldReason: 'Management discussion pending', onHoldDate: '2024-05-18', hoRoName: 'Rahul M', analystName: 'Prakash J', resultType: 'Standalone', documents: [] },
     { id: 'CE0001580', companyId: '45678', companyName: 'ICICI Bank', finInputSector: 'Bank', listed: 'Yes', cycle: 'Initial', receivedDate: '2024-05-18', auditedFY: '2023', status: 'ACCEPTED', subStatus: 'WIP', analystName: 'Jane Smith', resultType: 'Standalone', documents: [] },
];


export const mockDMSDocumentHistoryData: DMSDocumentHistory[] = [
    { documentName: 'Banker Interaction', dmsStatus: 'Pending', dmsProcessType: 'Revalidation', dmsUploadedOn: '2010-09-24 11:02 AM', dmsUploadedBy: '-', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'CIBIL Quarter 1', dmsStatus: 'Pending', dmsProcessType: 'Revalidation', dmsUploadedOn: '2011-05-09 10:48 AM', dmsUploadedBy: '-', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'CIBIL Quarter 2', dmsStatus: 'Pending', dmsProcessType: 'Revalidation', dmsUploadedOn: '2011-05-09 10:48 AM', dmsUploadedBy: '-', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'Information Memorandum', dmsStatus: 'Uploaded', dmsProcessType: 'Revalidation', dmsUploadedOn: '2010-09-24 10:48 AM', dmsUploadedBy: 'Maulesh Desai', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'Management Meeting', dmsStatus: 'Pending', dmsProcessType: 'Review', dmsUploadedOn: '2010-09-24 10:48 AM', dmsUploadedBy: '-', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'NDS', dmsStatus: 'Uploaded', dmsProcessType: 'Review', dmsUploadedOn: '2010-09-24 10:48 AM', dmsUploadedBy: 'Maulesh Desai', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'Rating Letter', dmsStatus: 'Uploaded', dmsProcessType: 'Review', dmsUploadedOn: '2010-09-24 10_48 AM', dmsUploadedBy: 'Maulesh Desai', reason: '-', mandateId: '2014-2015/20/21796' },
    { documentName: 'Rating letter and email of Rating...', dmsStatus: 'Uploaded', dmsProcessType: 'Review', dmsUploadedOn: '2010-09-24 10:48 AM', dmsUploadedBy: 'Maulesh Desai', reason: '-', mandateId: '2014-2015/20/21796' },
];


export const mockLatestBankDetails: LatestBankDetail[] = [
  { id: '109630', bankLender: 'Bank of Baroda', instrument: 'Term Loan', ratedAmount: 150, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 8 unequal...', remark: 'Outstanding as on June 30, 2024' },
  { id: '12363', bankLender: 'Indusind Bank...', instrument: 'Term Loan', ratedAmount: 95, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 16 unequal...', remark: 'Outstanding as on June 30, 2024' },
  { id: '12363', bankLender: 'HDFC Bank Ltd', instrument: 'Term Loan', ratedAmount: 65.6, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 14 unequal...', remark: 'Outstanding as on June 30, 2024' },
  { id: '12363', bankLender: 'HDFC Bank Ltd', instrument: 'Term Loan', ratedAmount: 150, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 8 unequal...', remark: '-' },
  { id: '12363', bankLender: 'HDFC Bank Ltd', instrument: 'Term Loan', ratedAmount: 150, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 8 unequal...', remark: '-' },
  { id: '12363', bankLender: 'HDFC Bank Ltd', instrument: 'Non Fund Based Limits', ratedAmount: 150, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 8 unequal...', remark: '-' },
  { id: '12363', bankLender: 'HDFC Bank Ltd', instrument: 'Term Loan', ratedAmount: 150, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 8 unequal...', remark: '-' },
  { id: '12363', bankLender: 'HDFC Bank Ltd', instrument: 'Term Loan', ratedAmount: 150, foreignCurrAmount: 0, currency: 'INR', debtRepaymentTerms: 'Repayable in 8 unequal...', remark: '-' },
];

export const mockAnnexureVHistoryData: AnnexureVHistory[] = [
    { id: '109630', instrument: 'Bank Facilities-Term Loan-Long Term', status: 'Active', amount: 464.90, count: 3, initialRatingDate: '2010-09-24', initialRating: 'CARE BB+', ratingActions: [{ date: '2010-09-24', rating: 'CARE BB+' }] },
    { id: '12363', instrument: 'Bank Facilities-Non-fund-based - ST-BG/LC', status: 'Closed', amount: 166.66, count: 0, initialRatingDate: '2011-05-09', initialRating: 'CARE A3', ratingActions: [{ date: '2011-05-09', rating: 'CARE A3' }] },
    { id: '12363', instrument: 'Bank Facilities-Fund-based - LT/ ST-Cash Credit', status: 'Closed', amount: 524.67, count: 0, initialRatingDate: '2011-05-09', initialRating: 'CARE BBB-', ratingActions: [{ date: '2011-05-09', rating: 'CARE BBB-' }] },
    { id: '12363', instrument: 'Term Loan', status: 'Closed', amount: 125.00, count: 3, initialRatingDate: '2010-09-24', initialRating: 'CARE A4', ratingActions: [{ date: '2010-09-24', rating: 'CARE A4' }] },
    { id: '12363', instrument: 'Term Loan', status: 'Withdrawn', amount: 0, count: 3, initialRatingDate: '2010-09-24', initialRating: 'CARE BB+', ratingActions: [{ date: '2010-09-24', rating: 'CARE BB+' }] },
    { id: '12363', instrument: 'Non Fund Based Limits', status: 'Active', amount: 886.01, count: 0, initialRatingDate: '2010-09-24', initialRating: 'CARE AA: Stable', ratingActions: [{ date: '2010-09-24', rating: 'CARE AA: Stable' }] },
    { id: '12363', instrument: 'Term Loan', status: 'Closed', amount: 1549.82, count: 0, initialRatingDate: '2010-09-24', initialRating: 'CARE BB+', ratingActions: [{ date: '2010-09-24', rating: 'CARE BB+' }] },
    { id: '12363', instrument: 'Term Loan', status: 'Closed', amount: 150.00, count: 0, initialRatingDate: '2010-09-24', initialRating: 'CARE BB+', ratingActions: [{ date: '2010-09-24', rating: 'CARE BB+' }] },
];

export const mockPressReleaseHistoryData: PressReleaseHistory[] = [
  { id: '109630', instrument: 'Bank Facilities-Term Loan-Long Term', instrumentStatus: 'Active', instrumentListed: 'Unlisted', meetingDate: '2010-09-24', ratedAmount: 464.90, revisionDate: '2010-09-24', revisedRating: 'CARE BB+', priorRevisionDate: '-', priorRating: '-' },
  { id: '12363', instrument: 'Bank Facilities-Non-fund-based - ST-BG/LC', instrumentStatus: 'Closed', instrumentListed: 'Unlisted', meetingDate: '2011-05-09', ratedAmount: 166.66, revisionDate: '2011-05-09', revisedRating: 'CARE A3', priorRevisionDate: '2010-09-24', priorRating: 'CARE A4+' },
  { id: '12363', instrument: 'Bank Facilities-Fund-based - LT/ST-Cash Credit', instrumentStatus: 'Closed', instrumentListed: 'Unlisted', meetingDate: '2011-05-09', ratedAmount: 524.67, revisionDate: '2011-05-09', revisedRating: 'CARE BBB-', priorRevisionDate: '2010-09-24', priorRating: 'CARE A' },
  { id: '12363', instrument: 'Term Loan', instrumentStatus: 'Closed', instrumentListed: 'Unlisted', meetingDate: '2010-09-24', ratedAmount: 125.00, revisionDate: '2010-09-24', revisedRating: 'CARE A4', priorRevisionDate: '-', priorRating: '-' },
  { id: '12363', instrument: 'Term Loan', instrumentStatus: 'Withdrawn', instrumentListed: 'Unlisted', meetingDate: '2010-09-24', ratedAmount: 0.00, revisionDate: '2010-09-24', revisedRating: 'CARE BB+', priorRevisionDate: '-', priorRating: '-' },
  { id: '12363', instrument: 'Non Fund Based Limits', instrumentStatus: 'Active', instrumentListed: 'Unlisted', meetingDate: '2010-09-24', ratedAmount: 886.01, revisionDate: '2010-09-24', revisedRating: 'CARE AA: Stable', priorRevisionDate: '-', priorRating: '-' },
  { id: '12363', instrument: 'Term Loan', instrumentStatus: 'Closed', instrumentListed: 'Unlisted', meetingDate: '2010-09-24', ratedAmount: 1549.82, revisionDate: '2010-09-24', revisedRating: 'CARE BB+', priorRevisionDate: '-', priorRating: '-' },
  { id: '12363', instrument: 'Term Loan', instrumentStatus: 'Closed', instrumentListed: 'Unlisted', meetingDate: '2010-09-24', ratedAmount: 150.00, revisionDate: '2010-09-24', revisedRating: 'CARE BB+', priorRevisionDate: '-', priorRating: '-' },
];


export const mockMandateData: Mandate[] = [
    {
        mandateId: '12100/121/1212',
        targetDate: '2024-09-15',
        primaryAnalyst: 'Amit Varma',
        ratingCycle: 'Initial',
        isSelected: true,
        instruments: [
            { instrumentId: '122342/1212', category: 'LT', subCategory: 'Fund Based', instrumentName: 'CC', instrumentAmt: 220000, enhanceReduce: -20000, totalInstrumentSize: 200000, agendaType: 'Surveillance', isSelected: true },
            { instrumentId: '122342/1212', category: 'ST', subCategory: 'Fund Based', instrumentName: 'LOC', instrumentAmt: 220000, enhanceReduce: -20000, totalInstrumentSize: 200000, agendaType: 'Surveillance', isSelected: true },
        ]
    },
    {
        mandateId: '12100/121/1213',
        targetDate: '2024-10-20',
        primaryAnalyst: 'Amit Varma',
        ratingCycle: 'Surveillance',
        isSelected: true,
        instruments: []
    }
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
     'ckc.admin@careedge.com': { uid: 'ckc.admin', email: 'ckc.admin@careedge.com', displayName: 'CKC Admin', role: 'CKC_ADMIN' },
     'ckc.analyst@careedge.com': { uid: 'ckc.analyst', email: 'ckc.analyst@careedge.com', displayName: 'CKC Analyst', role: 'CKC_ANALYST' },
     'ckc.checker@careedge.com': { uid: 'ckc.checker', email: 'ckc.checker@careedge.com', displayName: 'CKC Checker', role: 'CKC_CHECKER' },
};

export const mockQcUsers = [
    { id: 'qc-user-1', name: 'QC User 1' },
    { id: 'qc-user-2', name: 'QC User 2' },
    { id: 'qc-user-3', name: 'QC User 3' },
];

export const mockCompanies = [
    { id: 'COMP-101', companyName: 'Sun Pharmaceutical Industries Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-102', companyName: 'Dr. Reddy’s Laboratories Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-103', companyName: 'Cipla Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-104', companyName: 'Lupin Limited', ratingAnalystId: 'another.analyst', groupHeadId: 'another.gh' },
    { id: 'COMP-105', companyName: 'Aurobindo Pharma Limited', ratingAnalystId: 'rating.analyst@careedge', groupHeadId: 'group.head@careedge' },
    { id: 'COMP-106', companyName: 'Glenmark Pharmaceuticals Limited', ratingAnalystId: 'another.analyst', groupHeadId: 'group.head@careedge' },
];

export const mockTemplates = [
    { id: 'template-001', name: 'Standard Corporate Rating Template' },
    { id: 'template-002', name: 'Bank Rating Template' },
    { id: 'template-003', name: 'Infrastructure Project Rating Template' },
];

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
        contactDetails: [], auditorDetails: [], bankerDetails: [], dtDetails: [], ipaDetails: [], thirdPartyDetails: [],
        syncStatus: {
            source: 'CRM',
            lastUpdatedBy: 'crm-system',
            lastUpdatedAt: new Date().toISOString()
        }
    }
};

export const mockAuditorContacts = [
    { id: 'aud-contact-1', name: 'Amit Sharma', email: 'amit@abc.com', contact: '0000000000' },
    { id: 'aud-contact-2', name: 'Vijay Varma', email: 'vijay@abc.com', contact: '0000000000' },
    { id: 'aud-contact-3', name: 'Rajesh M.', email: 'rajesh@abc.com', contact: '0000000000' },
    { id: 'aud-contact-4', name: 'Prakash Jain', email: 'prakash@abc.com', contact: '0000000000' },
];

export const mockIpaContacts = [
    { id: 'ipa-contact-1', name: 'Amit Sharma', email: 'amit@abc.com', contact: '0000000000' },
    { id: 'ipa-contact-2', name: 'Vijay Varma', email: 'vijay@abc.com', contact: '0000000000' },
];

export const mockAuditorQuestionnaire: AuditorQuestionnaireItem[] = [
    { id: 'q1', particulars: 'Duration of association with the captioned entity' },
    { id: 'q2', particulars: 'Opinion on quality of accounts, compliance with Guidelines of ICAI, adherence to Accounting Standards, adequacy of internal control systems etc.' },
    { id: 'q3', particulars: 'Impact of change in accounting policy on the financials, if any' },
    { id: 'q4', particulars: 'Impact of <Qualified /adverse/disclaimer opinion> on the entity [If applicable]' },
    { id: 'q5', particulars: 'Debt repayment track record' },
    { id: 'q6', particulars: 'Track record of payment of undisputed statutory dues like PF, Service Tax, Income Tax etc.' },
    { id: 'q7', particulars: 'Details of hedging of foreign exchange and derivative transactions, if any' },
    { id: 'q8', particulars: 'Areas of risk identified by you at the time of audit, if any & measures taken by the management to mitigate them' },
    { id: 'q9', particulars: 'Views on nature and likelihood of devolvement of the contingent liabilities' },
    { id: 'q10', particulars: 'Existence of business contingency plans' },
    { id: 'q11', particulars: 'Any other information' },
];

export const mockDtaQuestionnaire: DtaQuestionnaireItem[] = [
    { id: 'dta-q1', particulars: 'Any delays in the servicing of interest/principal on the instruments. If yes, provide details w.r.t amount of delay, number of days of delay, date of delay, etc.' },
    { id: 'dta-q2', particulars: 'Any non-adherence to the terms and conditions (including cashflow waterfall, DSRA etc) or breach of material covenants as per the trust deed? If yes, provide details of the breach and its impact on interest rate or repayment schedule' },
    { id: 'dta-q3', particulars: 'Other adverse observation (including debt restructuring) if any' },
    { id: 'dta-q4', particulars: 'Any other information' },
];

export const mockIpaQuestionnaire: IpaQuestionnaireItem[] = [
    { id: 'ipa-q1', particulars: 'Any delays in the debt servicing on the instruments. If yes, provide details w.r.t amount of delay, number of days of delay, date of delay, etc.' },
    { id: 'ipa-q2', particulars: 'Any non-adherence to the terms of CP issue or payment structure for CPs backed by payment structure? If yes, provide details of non-adherence' },
    { id: 'ipa-q3', particulars: 'Other adverse observation if any' },
    { id: 'ipa-q4', particulars: 'Any other information' },
];


let mockAuditors: Auditor[] = [
    { 
        id: 'auditor-1', 
        firmName: 'A.U. Mojad & Associates', 
        discussions: [
            { id: 'd-1-1', contactPerson: 'Amit Sharma', discussionHappened: 'Yes', minutesCaptured: 'No', interactionDate: null, email: 'amit@abc.com', contact: '0000000000', status: 'Pending' },
            { id: 'd-1-2', contactPerson: 'Vijay Varma', discussionHappened: 'Yes', minutesCaptured: 'Partial', interactionDate: null, email: 'vijay@abc.com', contact: '0000000000', status: 'In Progress' },
            { id: 'd-1-3', contactPerson: 'Rajesh M.', discussionHappened: 'Yes', minutesCaptured: 'Yes', interactionDate: '2025-03-12', email: 'rajesh@abc.com', contact: '0000000000', status: 'Completed' },
        ] 
    },
    { 
        id: 'auditor-2', 
        firmName: 'Ashish R Pai & Associates', 
        discussions: [] 
    },
    { 
        id: 'auditor-3', 
        firmName: 'Deloitte Touche Tohmatsu India LLP', 
        discussions: [] 
    },
];

let mockBankers: Banker[] = [
    { 
        id: 'bank-1', 
        bankName: 'ICICI Bank', 
        discussions: [
            { id: 'd-b-1-1', contactPerson: 'Amit Sharma', discussionHappened: 'Yes', minutesCaptured: 'No', minutesCapturedOn: null, emailId: 'amit@icici.com', contact: '1111111111', status: 'Pending' },
            { id: 'd-b-1-2', contactPerson: 'Vijay Varma', discussionHappened: 'Yes', minutesCaptured: 'Partial', minutesCapturedOn: null, emailId: 'vijay@icici.com', contact: '2222222222', status: 'In Progress' },
            { id: 'd-b-1-3', contactPerson: 'Rajesh M.', discussionHappened: 'Yes', minutesCaptured: 'Yes', minutesCapturedOn: '2025-03-12', emailId: 'rajesh@icici.com', contact: '3333333333', status: 'Completed' },
        ] 
    },
    { id: 'bank-2', bankName: 'HDFC Bank', discussions: [] },
    { id: 'bank-3', bankName: 'Yes Bank', discussions: [] },
];

let mockDtas: DTA[] = [
    { id: 'dta-1', firmName: 'ABC Associates', discussions: [
        { id: 'd-dta-1-1', contactPerson: 'Amit Sharma', discussionHappened: 'Yes', minutesCaptured: 'No', minutesCapturedOn: null, emailId: 'amit@abc.com', contact: '0000000000', status: 'Pending' },
        { id: 'd-dta-1-2', contactPerson: 'Vijay Varma', discussionHappened: 'Yes', minutesCaptured: 'Partial', minutesCapturedOn: null, emailId: 'vijay@abc.com', contact: '0000000000', status: 'In Progress' },
    ]},
    { id: 'dta-2', firmName: 'PR Firm', discussions: [] },
    { id: 'dta-3', firmName: 'New India Associates', discussions: [] },
];

let mockIpas: IPA[] = [
    { id: 'ipa-1', firmName: 'SDK & PR Associates', discussions: [
        { id: 'd-ipa-1-1', contactPerson: 'Amit Sharma', discussionHappened: 'Yes', minutesCaptured: 'No', minutesCapturedOn: null, emailId: 'amit@abc.com', contact: '0000000000', status: 'Pending' },
        { id: 'd-ipa-1-2', contactPerson: 'Vijay Varma', discussionHappened: 'Yes', minutesCaptured: 'Partial', minutesCapturedOn: null, emailId: 'vijay@abc.com', contact: '0000000000', status: 'In Progress' },
    ]},
    { id: 'ipa-2', firmName: 'Nelson and Co.', discussions: [] },
    { id: 'ipa-3', firmName: 'Premchand Associations', discussions: [] },
];

let managementDiscussions: Record<string, ManagementDiscussion> = {};
let thirdPartyDiscussions: Record<string, ThirdPartyDiscussion> = {};
let auditCommitteeDiscussions: Record<string, AuditCommitteeDiscussion> = {};
let sitePlantVisits: Record<string, SitePlantVisit> = {};
let bankerLenderDetails: Record<string, BankerLenderDetail[]> = {};
let isinRecords: Record<string, ISINRecord[]> = {};

// --- New Rating Note Data Functions ---

export const getCkcRequests = (params: { status?: RequestStatus | null; id?: string | null }): CKCRequest[] => {
  let filteredRequests = ckcRequests;

  if (params.id) {
    return filteredRequests.filter(req => req.id === params.id);
  }

  if (params.status) {
    return filteredRequests.filter(req => req.status === params.status);
  }

  return filteredRequests;
};

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

export const getAuditorsByCompanyId = (companyId: string): Auditor[] => {
  // In a real app, this would be a filtered fetch based on companyId
  return mockAuditors;
};

export const getBankersByCompanyId = (companyId: string): Banker[] => {
  return mockBankers;
};

export const getDtasByCompanyId = (companyId: string): DTA[] => {
  return mockDtas;
};

export const getIpasByCompanyId = (companyId: string): IPA[] => {
  return mockIpas;
};

export const getAuditorDiscussionById = (auditorId: string, discussionId: string): AuditorDiscussion | undefined => {
    const auditor = mockAuditors.find(a => a.id === auditorId);
    return auditor?.discussions.find(d => d.id === discussionId);
};

export const updateAuditorDiscussion = (auditorId: string, discussionId: string, updates: Partial<AuditorDiscussion>): AuditorDiscussion | undefined => {
    const auditorIndex = mockAuditors.findIndex(a => a.id === auditorId);
    if (auditorIndex === -1) return undefined;
    
    const discussionIndex = mockAuditors[auditorIndex].discussions.findIndex(d => d.id === discussionId);
    if (discussionIndex === -1) return undefined;
    
    mockAuditors[auditorIndex].discussions[discussionIndex] = {
        ...mockAuditors[auditorIndex].discussions[discussionIndex],
        ...updates
    };

    return mockAuditors[auditorIndex].discussions[discussionIndex];
};

export const getBankerDiscussionById = (bankerId: string, discussionId: string): BankerDiscussion | undefined => {
    const banker = mockBankers.find(a => a.id === bankerId);
    return banker?.discussions.find(d => d.id === discussionId);
};

export const updateBankerDiscussion = (bankerId: string, discussionId: string, updates: Partial<BankerDiscussion>): BankerDiscussion | undefined => {
    const bankerIndex = mockBankers.findIndex(a => a.id === bankerId);
    if (bankerIndex === -1) return undefined;
    
    const discussionIndex = mockBankers[bankerIndex].discussions.findIndex(d => d.id === discussionId);
    if (discussionIndex === -1) return undefined;
    
    mockBankers[bankerIndex].discussions[discussionIndex] = {
        ...mockBankers[bankerIndex].discussions[discussionIndex],
        ...updates
    };

    return mockBankers[bankerIndex].discussions[discussionIndex];
};

export const getDtaDiscussionById = (dtaId: string, discussionId: string): DTADiscussion | undefined => {
    const dta = mockDtas.find(a => a.id === dtaId);
    return dta?.discussions.find(d => d.id === discussionId);
};

export const updateDtaDiscussion = (dtaId: string, discussionId: string, updates: Partial<DTADiscussion>): DTADiscussion | undefined => {
    const dtaIndex = mockDtas.findIndex(a => a.id === dtaId);
    if (dtaIndex === -1) return undefined;
    
    const discussionIndex = mockDtas[dtaIndex].discussions.findIndex(d => d.id === discussionId);
    if (discussionIndex === -1) return undefined;
    
    mockDtas[dtaIndex].discussions[discussionIndex] = {
        ...mockDtas[dtaIndex].discussions[discussionIndex],
        ...updates
    };

    return mockDtas[dtaIndex].discussions[discussionIndex];
};


export const getDMSDocumentHistoryByCompanyId = (companyId: string): DMSDocumentHistory[] => {
  return mockDMSDocumentHistoryData;
}

export const getPressReleaseHistoryByCompanyId = (companyId: string): PressReleaseHistory[] => {
    return mockPressReleaseHistoryData;
}


export const getAnnexureVHistoryByCompanyId = (companyId: string): AnnexureVHistory[] => {
    return mockAnnexureVHistoryData || [];
}

export const getNotesByRole = (role: Role, userId: string): RatingNote[] => {
    if (!userId) return [];
    switch(role) {
        case 'RATING_ANALYST':
            // RA sees all notes they initiated or that are pending PR generation by them
            return ratingNotes.filter(note => note.initiatedBy === userId || (note.status === 'PR Generation Pending' && note.currentActor === 'RATING_ANALYST'));
        case 'GROUP_HEAD':
        case 'QC':
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

export const getPressReleaseHistoryByNoteId = (noteId: string): PressReleaseHistoryEntry[] => {
    const note = getNoteById(noteId);
    if (!note) return [];
    
    // Find instruments for the company associated with the note
    const instruments = ratingInstruments[note.companyId] || [];

    return mockPressReleaseHistoryData
      .map(pr => {
          const mandatesWithInstruments = pr.mandates.map(mandate => {
              const matchingInstrument = instruments.find(i => i.mandateId === mandate.mandateId);
              const historyInstruments: PressReleaseHistoryInstrument[] = mandate.instruments.map(inst => ({
                  ...inst,
                  agendaType: matchingInstrument?.cycleHistory[0]?.meetingType || 'N/A', // just an example
                  ratingAssigned: matchingInstrument?.cycleHistory[0]?.rating || 'N/A',
              }));
              return { ...mandate, instruments: historyInstruments };
          });
          return { ...pr, mandates: mandatesWithInstruments };
    });
};

export const getInstrumentsByCompanyId = (companyId: string): RatingInstrument[] => {
  return ratingInstruments[companyId] || [];
}

export const getInstrumentById = (instrumentId: string): RatingInstrument | undefined => {
  for (const companyId in ratingInstruments) {
    const instrument = ratingInstruments[companyId].find(inst => inst.id === instrumentId);
    if (instrument) return instrument;
  }
  return undefined;
};

export const getLatestBankDetailsByCompanyId = (companyId: string): LatestBankDetail[] => {
  return mockLatestBankDetails || [];
}

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

export const updateNoteStatus = (id: string, newStatus: NoteStatus, actorId: string, updates?: Partial<RatingNote>) => {
    const note = getNoteById(id);
    if (!note) return null;
    
    let combinedUpdates: Partial<RatingNote> = {
        ...updates,
        status: newStatus,
        statusHistory: [...note.statusHistory, { status: newStatus, timestamp: new Date().toISOString(), actorId }],
    };
    
    // Update currentActor based on the new status
    switch (newStatus) {
        case 'In Review (GH)':
            combinedUpdates.currentActor = 'GROUP_HEAD';
            break;
        case 'In Review (QC)':
            combinedUpdates.currentActor = 'QC';
            break;
        case 'Rework Requested (GH)': // QC sends back to GH
             combinedUpdates.currentActor = 'GROUP_HEAD';
             break;
        case 'Approved by QC':
            combinedUpdates.currentActor = 'GROUP_HEAD';
            break;
        case 'PR Generation Pending':
            combinedUpdates.currentActor = 'RATING_ANALYST';
            break;
        case 'PR Generated':
        case 'Completed':
            combinedUpdates.currentActor = 'SYSTEM'; // Or GH, depends on final hand-off
            break;
    }
    
    return updateNote(id, combinedUpdates);
};


// --- Old CKC Request Functions (can be deprecated later) ---

let requests: any[] = [];

export const getRequests = (status?: string, id?: string) => {
  return [];
};


export const getRequestById = (id: string): any | undefined => {
  return undefined;
};


export const acceptRequest = (requestId: string, userId: string, userName: string) => {
    return null;
};

export const initiateRequest = (id: string, user: AppUser) => {
    return null;
}

export const submitForChecking = (id: string, user: AppUser) => {
    return null;
}

export const sendBackRequest = (id: string, user: AppUser, remarks: string) => {
    return null;
}

export const approveRequest = (id: string, user: AppUser) => {
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


export const getManagementDiscussion = (companyId: string): ManagementDiscussion | undefined => {
    return managementDiscussions[companyId];
}
export const saveManagementDiscussion = (companyId: string, data: Partial<ManagementDiscussion>): ManagementDiscussion => {
    managementDiscussions[companyId] = { ...managementDiscussions[companyId], ...data, companyId };
    return managementDiscussions[companyId];
}

export const getThirdPartyDiscussion = (companyId: string): ThirdPartyDiscussion | undefined => {
    return thirdPartyDiscussions[companyId];
}
export const saveThirdPartyDiscussion = (companyId: string, data: Partial<ThirdPartyDiscussion>): ThirdPartyDiscussion => {
    thirdPartyDiscussions[companyId] = { ...thirdPartyDiscussions[companyId], ...data, companyId };
    return thirdPartyDiscussions[companyId];
}

export const getAuditCommitteeDiscussion = (companyId: string): AuditCommitteeDiscussion | undefined => {
    return auditCommitteeDiscussions[companyId];
}
export const saveAuditCommitteeDiscussion = (companyId: string, data: Partial<AuditCommitteeDiscussion>): AuditCommitteeDiscussion => {
    auditCommitteeDiscussions[companyId] = { ...auditCommitteeDiscussions[companyId], ...data, companyId };
    return auditCommitteeDiscussions[companyId];
}

export const getSitePlantVisit = (companyId: string): SitePlantVisit | undefined => {
    return sitePlantVisits[companyId];
}
export const saveSitePlantVisit = (companyId: string, data: Partial<SitePlantVisit>): SitePlantVisit => {
    sitePlantVisits[companyId] = { ...sitePlantVisits[companyId], ...data, companyId };
    return sitePlantVisits[companyId];
}

export const getBankerLenderDetails = (instrumentId: string, rcmId: string): BankerLenderDetail[] => {
    const key = `${instrumentId}-${rcmId}`;
    return bankerLenderDetails[key] || [];
}

export const updateBankerLenderDetails = (instrumentId: string, rcmId: string, details: BankerLenderDetail[]): BankerLenderDetail[] => {
    const key = `${instrumentId}-${rcmId}`;
    bankerLenderDetails[key] = details;
    return bankerLenderDetails[key];
}

export const getIsinRecords = (instrumentId: string, rcmId: string): ISINRecord[] => {
    const key = `${instrumentId}-${rcmId}`;
    return isinRecords[key] || [];
}

export const updateIsinRecord = (instrumentId: string, rcmId: string, records: ISINRecord[]): ISINRecord[] => {
    const key = `${instrumentId}-${rcmId}`;
    isinRecords[key] = records;
    return isinRecords[key];
}

// --- DMS Document History Functions ---

export const getDMSDocumentHistory = (companyId: string): DMSDocumentHistory[] => {
  return mockDMSDocumentHistoryData;
}
