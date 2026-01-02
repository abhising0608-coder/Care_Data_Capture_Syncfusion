'use client';
import { E2ETestRunner } from '@/components/e2e-test-runner';

export default function E2ETestPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    End-to-End Test Runner
                </h1>
                <p className="text-muted-foreground">
                    This is an automated simulation of the entire rating note workflow. The test will proceed step-by-step.
                </p>
            </header>
            <E2ETestRunner />
        </div>
    );
}
