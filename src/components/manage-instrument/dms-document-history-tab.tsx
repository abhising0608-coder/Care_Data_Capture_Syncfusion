
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DMSDocumentHistoryTable } from "./dms-document-history-table";

export function DMSDocumentHistoryTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DMS Document History</CardTitle>
        <CardDescription>
          A table listing historical documents from the DMS (Document Management System).
        </CardDescription>
      </CardHeader>
      <CardContent>
         <DMSDocumentHistoryTable />
      </CardContent>
    </Card>
  );
}
