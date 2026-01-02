'use client';

import { E2ETestRunner } from '@/components/e2e-test-runner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function E2ETestPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Live BDD Test Runner</CardTitle>
                    <CardDescription>
                        This dashboard simulates a full end-to-end user workflow automatically. Observe the test log and status as it progresses through each step, role, and action.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <E2ETestRunner />
                </CardContent>
            </Card>
        </div>
    );
}
