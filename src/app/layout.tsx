'use client';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { registerLicense } from '@syncfusion/ej2-base';

// Register the Syncfusion license key at the module level
registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF5cXGpCf0x3QXxbf1x2ZFRHal5ZTndbUj0eQnxTdEBiW35bcndXTmFVV01/VkleYQ==');


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
