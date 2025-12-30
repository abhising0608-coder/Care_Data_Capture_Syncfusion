'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CompanyMaster } from '@/lib/definitions';

interface CompanyMasterInfoProps {
    masterSnapshot: CompanyMaster;
}

const InfoField = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="grid gap-2">
        <Label htmlFor={label}>{label}</Label>
        <Input id={label} value={value || ''} readOnly disabled />
    </div>
);

export function CompanyMasterInfo({ masterSnapshot }: CompanyMasterInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Master Information (Read-Only)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <InfoField label="Address" value={masterSnapshot.address} />
                    <InfoField label="City" value={masterSnapshot.city} />
                    <InfoField label="Zip Code" value={masterSnapshot.zipCode} />
                    <InfoField label="State" value={masterSnapshot.state} />
                    <InfoField label="Country" value={masterSnapshot.country} />
                    <InfoField label="Listing Status" value={masterSnapshot.listingStatus} />
                    <InfoField label="Listing In" value={masterSnapshot.listingIn} />
                    <InfoField label="Macro Economic Indicator" value={masterSnapshot.macroEconomicIndicator} />
                    <InfoField label="Sector" value={masterSnapshot.sector} />
                    <InfoField label="Industry" value={masterSnapshot.industry} />
                    <InfoField label="Basic Industry" value={masterSnapshot.basicIndustry} />
                </div>
            </CardContent>
        </Card>
    );
}
