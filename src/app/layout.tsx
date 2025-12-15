'use client';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // Register the Syncfusion license key
    registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cWWJCe0x3Q3xbf1x0ZFNMyV5bQXVPMyBoS35RdURhW35ednBRR2BeWUJ1');
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" style={{fontFamily: "'Inter', sans-serif"}}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
