'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function InstrumentDetailsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Instrument Details</CardTitle>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Instrument
            </Button>
          </div>
          <CardDescription>
            A table listing instruments with details like ISIN, amount, tenor, and rating would be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
             <p>(Placeholder for Instrument Details Table)</p>
           </div>
        </CardContent>
      </Card>
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
