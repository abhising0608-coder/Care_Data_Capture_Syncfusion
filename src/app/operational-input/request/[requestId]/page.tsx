import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RequestDetailPage({ params }: { params: { requestId: string } }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Request Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Request ID: {params.requestId}
        </p>
        <p className="text-sm text-muted-foreground">
          Data entry screen will be built here.
        </p>
      </div>
    </div>
  );
}
