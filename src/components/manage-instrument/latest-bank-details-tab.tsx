
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestBankDetailsTable } from "./latest-bank-details-table";

export function LatestBankDetailsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Bank Details</CardTitle>
        <CardDescription>
          A view-only list of the latest banker and lender details for the selected company.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LatestBankDetailsTable />
      </CardContent>
    </Card>
  );
}
