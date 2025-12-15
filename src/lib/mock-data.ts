import { CKCRequest } from './definitions';

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
    assignedTo: null,
    checker: 'Checker X',
    status: 'PENDING',
    cycle: 'Initial',
    auditedFY: ['2023'],
    provisionalFY: ['2024'],
    projectionFY: [],
    remarks: 'Initial request for FY23.',
    receiptDateTime: '2024-05-01T10:00:00Z',
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    createdBy: 'Initiator 1',
    overallStatus: 'Pending Acceptance',
    itemType: 'New Request',
    path: '/requests/REQ-001',
    resultType: 'Standalone',
    ckcAnalystName: undefined,
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
    assignedTo: 'mock-user-123',
    checker: 'Checker Y',
    status: 'ACCEPTED',
    cycle: 'Surveillance',
    auditedFY: ['2022', '2023'],
    provisionalFY: [],
    projectionFY: ['2025'],
    remarks: 'Surveillance for FY22-23.',
    receiptDateTime: '2024-05-02T11:30:00Z',
    receiptResponseDateTime: '2024-05-02T12:00:00Z',
    entryAllottedDateTime: '2024-05-03T09:00:00Z',
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    createdBy: 'Initiator 2',
    overallStatus: 'Entry in Progress',
    itemType: 'Surveillance',
    path: '/requests/REQ-002',
    resultType: 'Consolidated',
    ckcAnalystName: 'CKC Analyst',
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
    assignedTo: 'another-user-456',
    checker: 'Checker Z',
    status: 'CLOSED',
    cycle: 'Initial',
    auditedFY: ['2023'],
    provisionalFY: [],
    projectionFY: [],
    remarks: 'Completed and closed.',
    receiptDateTime: '2024-04-15T09:00:00Z',
    receiptResponseDateTime: '2024-04-15T10:00:00Z',
    entryAllottedDateTime: '2024-04-16T10:00:00Z',
    entryCompletedDateTime: '2024-04-20T17:00:00Z',
    checkingAllottedDateTime: '2024-04-21T10:00:00Z',
    checkingCompletedDateTime: '2024-04-25T18:00:00Z',
    sentBackFlag: false,
    createdBy: 'Initiator 3',
    overallStatus: 'Completed',
    itemType: 'New Request',
    path: '/requests/REQ-003',
    resultType: 'Standalone',
    ckcAnalystName: 'Another Analyst',
  },
  // Add more pending requests
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
    assignedTo: null,
    checker: 'Checker X',
    status: 'PENDING',
    cycle: 'Surveillance',
    auditedFY: ['2023'],
    provisionalFY: [],
    projectionFY: [],
    remarks: 'Annual surveillance.',
    receiptDateTime: '2024-05-10T14:00:00Z',
    receiptResponseDateTime: null,
    entryAllottedDateTime: null,
    entryCompletedDateTime: null,
    checkingAllottedDateTime: null,
    checkingCompletedDateTime: null,
    sentBackFlag: false,
    createdBy: 'Initiator 1',
    overallStatus: 'Pending Acceptance',
    itemType: 'Surveillance',
    path: '/requests/REQ-004',
    resultType: 'Consolidated',
    ckcAnalystName: undefined,
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
        }
    }
};

export const getRequests = (status?: string, id?: string) => {
  let filteredRequests = requests;
  if (status) {
    filteredRequests = filteredRequests.filter(r => r.status === status);
  }
  if (id) {
    filteredRequests = filteredRequests.filter(r => r.id === id);
  }
  return filteredRequests;
};

export const getRequestById = (id: string) => {
  return requests.find(r => r.id === id);
};

export const acceptRequest = (id: string, userId: string, userName: string) => {
  const requestIndex = requests.findIndex(r => r.id === id);
  if (requestIndex !== -1) {
    requests[requestIndex] = {
      ...requests[requestIndex],
      status: 'ACCEPTED',
      assignedTo: userId,
      ckcAnalystName: userName,
      entryAllottedDateTime: new Date().toISOString(),
      overallStatus: 'Entry Pending',
    };
    return requests[requestIndex];
  }
  return null;
};


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
