'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PressReleaseHistoryTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Press Release History</CardTitle>
        <CardDescription>
          A table listing historical press releases from the DMS (Document Management System).
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            <p>(Placeholder for DMS Document History Table)</p>
         </div>
      </CardContent>
    </Card>
  );
}
