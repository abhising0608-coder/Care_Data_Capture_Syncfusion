import { RequestsList } from '@/components/requests/requests-list';

export default function CkcRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Requests</h1>
        <p className="text-muted-foreground">Accept and manage operational data requests.</p>
      </div>
      <RequestsList />
    </div>
  );
}
