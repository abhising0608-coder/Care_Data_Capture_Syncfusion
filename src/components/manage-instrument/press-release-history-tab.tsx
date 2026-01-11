
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PressReleaseHistoryTable } from "./press-release-history-table";

export function PressReleaseHistoryTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Press Release Details History</CardTitle>
        <CardDescription>
          A view-only table displaying the press release history for all instruments of the company.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <PressReleaseHistoryTable />
      </CardContent>
    </Card>
  );
}
