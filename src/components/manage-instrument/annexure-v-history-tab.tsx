'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnexureVHistoryTable } from "./annexure-v-history-table";

export function AnnexureVHistoryTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annexure V History</CardTitle>
        <CardDescription>
          A view-only table displaying the complete rating history for all instruments of the company.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnnexureVHistoryTable />
      </CardContent>
    </Card>
  );
}
