# **App Name**: CareEdge Operational Data Input

## Core Features:

- Pending Request List: Display a paginated list of operational data requests with 'PENDING' status from Firestore, including Request ID, Company Name, Company ID, Listed, Cycle, Received Date, Audited FY, and Actions.
- Accept Request: Allow CKC Analysts to accept a request by clicking a checkmark icon, which updates the request's status in Firestore to 'ACCEPTED' and assigns it to the logged-in analyst.  The action implements a first-come-first-serve rule.
- Request ID Hyperlink: Make the Request ID a hyperlink that navigates to the `/operational-input/request/{requestId}` route.
- Smart Search: Implement a search bar that allows searching across Request ID, Company Name, Company ID, Cycle, and Audited FY.
- Filtering: Implement filters for Listed (Yes/No), Cycle (Initial/Surveillance), and Audited FY.
- Status Updates: Show a toast notification when a request is accepted, confirming the action to the user.
- New Request Alert: Implements an always-visible Notification bell icon which indicates the number of new requests and is linked to the new request list page.

## Style Guidelines:

- Primary color: Deep blue (#1A237E) to convey trust and professionalism, aligning with BFSI industry standards.
- Background color: Off-white (#F5F5F5) for a clean and neutral enterprise UI.
- Accent color: Teal (#008080) to highlight interactive elements and important actions. This complements the deep blue by adding a touch of vibrancy.
- Body and headline font: 'Inter', a sans-serif font, for clear and modern readability in both headings and body text. Note: currently only Google Fonts are supported.
- Use clean and consistent icons from a library like Material Icons for actions and filters.
- Maintain a consistent grid-based layout with sufficient white space to ensure clarity and readability. Prioritize clear column alignment in the data table.
- Use subtle transition animations for actions like accepting requests or opening filters to provide visual feedback without being intrusive.