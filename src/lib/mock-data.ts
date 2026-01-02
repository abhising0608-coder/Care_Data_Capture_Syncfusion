
import type { CKCRequest, AppUser, Role, RequestStatus, CompanyInfo, CompanyDashboard, RatingNote, NoteStatus } from './definitions';

let ratingNotes: RatingNote[] = [
    { 
        id: 'NOTE-001', 
        companyName: 'Sun Pharmaceutical Industries Limited', 
        companyId: 'COMP-101',
        ratingCycle: 'Initial', 
        priority: 'High', 
        dueDate: '1 Jan 26', 
        status: 'Completed',
        raId: 'rating.analyst@careedge',
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
        ]
    },
    { 
        id: 'NOTE-002', 
        companyName: 'Dr. Reddy’s Laboratories Limited', 
        companyId: 'COMP-102',
        ratingCycle: 'Surveillance', 
        priority: 'Medium', 
        dueDate: '3 Feb 26', 
        status: 'Draft',
        raId: 'rating.analyst@careedge',
        editorContent: '',
        statusHistory: [
            { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' }
        ]
    },
    { 
        id: 'NOTE-003', 
        companyName: 'Cipla Limited', 
        companyId: 'COMP-103',
        ratingCycle: 'Initial', 
        priority: 'Low', 
        dueDate: '10 Mar 26', 
        status: 'In Review (GH)',
        raId: 'rating.analyst@careedge',
        ghId: 'group.head@careedge',
        editorContent: '',
        statusHistory: [
             { status: 'Draft', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' },
             { status: 'In Review (GH)', timestamp: new Date().toISOString(), actorId: 'rating.analyst@careedge' }
        ]
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

export const mockCompanies = [
    { id: 'COMP-101', companyName: 'Sun Pharmaceutical Industries Limited' },
    { id: 'COMP-102', companyName: 'Dr. Reddy’s Laboratories Limited' },
    { id: 'COMP-103', companyName: 'Cipla Limited' },
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
        auditorDetails: [],
        bankerDetails: [],
        dtDetails: [],
        ipaDetails: [],
        thirdPartyDetails: [],
        syncStatus: {
            source: 'CRM',
            lastUpdatedBy: 'crm-system',
            lastUpdatedAt: new Date().toISOString()
        }
    }
};

// --- New Rating Note Data Functions ---

export const getNotesByRole = (role: Role, userId: string): RatingNote[] => {
    switch(role) {
        case 'RATING_ANALYST':
            return ratingNotes.filter(note => note.raId === userId && ['Draft', 'Rework Requested', 'Rework Requested (GH)', 'Pending RR & PR (RA)'].includes(note.status));
        case 'GROUP_HEAD':
            return ratingNotes.filter(note => note.ghId === userId && ['In Review (GH)', 'Rework Requested (GH)', 'QC Approved', 'CC Approved', 'In Final Review (GH)'].includes(note.status));
        case 'QC':
             return ratingNotes.filter(note => note.status === 'In Review (QC)');
        case 'RATING_COMMITTEE':
            return ratingNotes.filter(note => note.status === 'In Review (CC)');
        default:
            // Return all notes for admin-like roles or an empty array for others
            return ['CKC_ADMIN', 'SYSTEM'].includes(role) ? ratingNotes : [];
    }
}

export const getNoteById = (id: string): RatingNote | undefined => {
  const note = ratingNotes.find(r => r.id === id);
  return note ? JSON.parse(JSON.stringify(note)) : undefined;
};

export const updateNote = (id: string, updates: Partial<RatingNote>): RatingNote | null => {
    const noteIndex = ratingNotes.findIndex(r => r.id === id);
    if (noteIndex === -1) return null;
    
    const originalNote = ratingNotes[noteIndex];
    const updatedNote = { ...originalNote, ...updates };

    ratingNotes[noteIndex] = updatedNote;
    return JSON.parse(JSON.stringify(updatedNote));
}

export const updateNoteStatus = (id: string, newStatus: NoteStatus, actorId: string, editorContent?: string) => {
    const note = getNoteById(id);
    if (!note) return null;

    note.status = newStatus;
    note.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        actorId,
    });
    
    if (editorContent) {
        note.editorContent = editorContent;
    }
    
    // Assign to specific roles on status change
    switch (newStatus) {
        case 'In Review (GH)':
            note.ghId = 'group.head@careedge';
            break;
        case 'In Review (QC)':
            note.qcId = 'qc@careedge.com';
            break;
        case 'In Review (CC)':
            note.ccId = 'cc@careedge.com';
            break;
        case 'Rework Requested': // GH sends back to RA
             note.raId = note.raId; // Stays with original RA
             break;
        case 'Rework Requested (GH)': // QC or CC sends back to GH
            note.ghId = note.ghId; // Stays with original GH
            break;
        case 'Pending RR & PR (RA)':
            note.raId = note.raId; // Assign back to RA
            break;
    }
    
    return updateNote(id, note);
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
