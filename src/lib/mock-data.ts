import type { CKCRequest, AppUser, Role, RequestStatus } from './definitions';

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
    ]
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
    ]
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
    ]
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
    ]
  },
];


let operationalInputData: Record<string, any> = {
    'REQ-002': {
        id: 'REQ-002',
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
        sectorial_operational_data: {
          manufacturingFacilities: {
            dataAvailability: 'Available',
            activeVersion: 1,
            versions: [
              {
                version: 1,
                timestamp: '2024-05-20T10:00:00Z',
                workbookJson: {} // Placeholder for Syncfusion JSON
              }
            ]
          },
           geographyWiseSales: {
            dataAvailability: 'Available',
            activeVersion: 1,
            versions: [
              {
                version: 1,
                timestamp: '2024-05-20T10:00:00Z',
                workbookJson: {} // Placeholder for Syncfusion JSON
              }
            ]
          }
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

export const getRequestById = (id: string) => {
  const request = requests.find(r => r.id === id);
  return request ? JSON.parse(JSON.stringify(request)) : undefined;
};

const updateRequestStatus = (id: string, newStatus: RequestStatus, actor: AppUser) => {
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) return null;

    const request = requests[requestIndex];
    
    // Add to history
    request.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        actorId: actor.uid,
        actorRole: actor.role,
        remarks: `Status changed to ${newStatus}`
    });

    request.status = newStatus;
    
    switch (newStatus) {
        case 'ACCEPTED':
            request.currentOwnerId = actor.uid;
            request.currentOwnerRole = 'CKC_ANALYST';
            break;
        case 'IN_PROGRESS':
            // Owner remains CKC Analyst
            break;
        case 'SUBMITTED_FOR_CHECK':
            request.currentOwnerId = request.assignedCheckerId;
            request.currentOwnerRole = 'CKC_CHECKER';
            break;
        case 'SENT_BACK':
            // Find the original analyst from history
            const analystEntry = request.statusHistory.find(h => h.actorRole === 'CKC_ANALYST');
            request.currentOwnerId = analystEntry ? analystEntry.actorId : null;
            request.currentOwnerRole = 'CKC_ANALYST';
            break;
        case 'APPROVED':
            // Owner remains the checker
            break;
        case 'CLOSED':
             request.currentOwnerId = null;
             request.currentOwnerRole = 'SYSTEM';
             // In a real app, this might trigger notifications
             break;
    }
    
    requests[requestIndex] = request;
    return request;
}

export const acceptRequest = (id: string, user: AppUser) => {
  return updateRequestStatus(id, 'ACCEPTED', user);
};

export const initiateRequest = (id: string, user: AppUser) => {
    return updateRequestStatus(id, 'IN_PROGRESS', user);
}

export const submitForChecking = (id: string, user: AppUser) => {
    return updateRequestStatus(id, 'SUBMITTED_FOR_CHECK', user);
}

export const sendBackRequest = (id: string, user: AppUser) => {
    return updateRequestStatus(id, 'SENT_BACK', user);
}

export const approveRequest = (id: string, user: AppUser) => {
    // First approve, then close
    const approvedRequest = updateRequestStatus(id, 'APPROVED', user);
    if(approvedRequest) {
        // System action to close
        return updateRequestStatus(id, 'CLOSED', { uid: 'system', role: 'SYSTEM', displayName: 'System' });
    }
    return null;
}


export const getOperationalInput = (id: string) => {
    return operationalInputData[id] || null;
}

export const saveOperationalInput = (id: string, data: any) => {
    if (!operationalInputData[id]) {
        operationalInputData[id] = { id };
    }
    operationalInputData[id] = { ...operationalInputData[id], ...data };
    return operationalInputData[id];
}
