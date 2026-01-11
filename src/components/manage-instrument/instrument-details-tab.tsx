
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstrumentDetailsTable } from "./instrument-details-table";


export function InstrumentDetailsTab() {
  return (
    <div className="space-y-6">
        <InstrumentDetailsTable />
      <Card>
        <CardHeader>
          <CardTitle>Latest Lender Details</CardTitle>
          <CardDescription>
            Details about the latest lenders associated with the instruments.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
             <p>(Placeholder for Lender Details)</p>
           </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Annexure V History</CardTitle>
           <CardDescription>
            Historical records of Annexure V submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
             <p>(Placeholder for Annexure V History Table)</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
