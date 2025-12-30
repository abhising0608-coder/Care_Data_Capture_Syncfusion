import type { CKCRequest, AppUser, Role, RequestStatus, CompanyInfo } from './definitions';

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
    projectionFY: ['2025'],
    remarks: 'Surveillance for FY22-23.',
    receiptDateTime: '2024-05-02T11:30:00Z',
    createdBy: 'Initiator 2',
    resultType: 'Consolidated',
    currentOwnerId: 'analyst-001',
    currentOwnerRole: 'CKC_ANALYST',
    assignedCheckerId: 'checker-001',
    statusHistory: [
        { status: 'PENDING', timestamp: '2024-05-02T11:30:00Z', actorId: 'system', actorRole: 'SYSTEM' },
        { status: 'ACCEPTED', timestamp: '2024-05-02T14:00:00Z', actorId: 'analyst-001', actorRole: 'CKC_ANALYST' },
        { status: 'IN_PROGRESS', timestamp: '2024-05-02T14:05:00Z', actorId: 'analyst-001', actorRole: 'CKC_ANALYST' }
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
    assignedTo: 'analyst-001',
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
];


let operationalInputData: Record<string, any> = {
    'REQ-002': {
        id: 'REQ-002',
        status: 'IN_PROGRESS',
        currentOwnerId: 'analyst-001',
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

let companyInfoData: Record<string, CompanyInfo> = {
    'RC-001': {
        masterSnapshot: {
            address: '123 Maker Towers',
            city: 'Mumbai',
            zipCode: '400021',
            state: 'Maharashtra',
            country: 'India',
            listingStatus: 'Listed',
            listingIn: 'BSE, NSE',
            macroEconomicIndicator: 'Normal',
            sector: 'Information Technology',
            industry: 'IT Services',
            basicIndustry: 'Software Development'
        },
        groupSelection: {
            group: 'Tata Group',
            groupForCombinedApproach: ''
        },
        contactDetails: [
            { id: 'c1', name: 'Mr. Rajesh Gopinathan', designation: 'CEO', email: 'ceo@tcs.com', phone: '123-456-7890' }
        ],
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


export const getRequests = (status?: RequestStatus | RequestStatus[], id?: string) => {
  let filteredRequests = requests;
  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
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
            break;
        case 'IN_PROGRESS':
             request.currentOwnerId = actor.uid;
             request.currentOwnerRole = 'CKC_ANALYST';
            break;
        case 'SUBMITTED_FOR_CHECK':
            request.currentOwnerId = request.assignedCheckerId;
            request.currentOwnerRole = 'CKC_CHECKER';
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
            break;
        case 'CLOSED':
             request.currentOwnerId = null;
             request.currentOwnerRole = 'SYSTEM';
             break;
    }
    
    requests[requestIndex] = request;
    return request;
}

export const acceptRequest = (id: string, user: AppUser) => {
  const request = getRequestById(id);
  if (request?.status !== 'PENDING') return null; // Can only accept pending requests
  return updateRequestStatus(id, 'ACCEPTED', user);
};

export const initiateRequest = (id: string, user: AppUser) => {
    return updateRequestStatus(id, 'IN_PROGRESS', user);
}

export const submitForChecking = (id: string, user: AppUser) => {
    const operationalData = getOperationalInput(id);
    operationalData.status = 'SUBMITTED_FOR_CHECK';
    operationalData.currentOwnerId = operationalData.assignedCheckerId;
    operationalData.currentOwnerRole = 'CKC_CHECKER';
    saveOperationalInput(id, operationalData);
    return updateRequestStatus(id, 'SUBMITTED_FOR_CHECK', user);
}

export const sendBackRequest = (id: string, user: AppUser, remarks: string) => {
    const operationalData = getOperationalInput(id);
    operationalData.status = 'SENT_BACK';
    const analystEntry = getRequestById(id)?.statusHistory.find(h => h.actorRole === 'CKC_ANALYST');
    operationalData.currentOwnerId = analystEntry ? analystEntry.actorId : null;
    operationalData.currentOwnerRole = 'CKC_ANALYST';
    saveOperationalInput(id, operationalData);
    return updateRequestStatus(id, 'SENT_BACK', user, remarks);
}

export const approveRequest = (id: string, user: AppUser) => {
    const operationalData = getOperationalInput(id);
    operationalData.status = 'APPROVED';
    operationalData.currentOwnerId = user.uid;
    operationalData.currentOwnerRole = 'CKC_CHECKER';
    saveOperationalInput(id, operationalData);
    
    const approvedRequest = updateRequestStatus(id, 'APPROVED', user);
    if(approvedRequest) {
        return updateRequestStatus(id, 'CLOSED', { uid: 'system', role: 'SYSTEM', displayName: 'System' });
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
    return companyInfoData[ratingCycleId] ? JSON.parse(JSON.stringify(companyInfoData[ratingCycleId])) : null;
}

export const saveCompanyInfo = (ratingCycleId: string, data: CompanyInfo): CompanyInfo => {
    companyInfoData[ratingCycleId] = data;
    return JSON.parse(JSON.stringify(data));
}
