
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
// Toaster is now only in the root layout src/app/layout.tsx
// import { Toaster } from "@/components/ui/toaster";
// AuthProvider is now only in the root layout src/app/layout.tsx
// import { AuthProvider } from '@/contexts/auth-context';
import GlobalNavBar from '@/components/global-nav-bar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata can still be defined here, Next.js will merge it.
export const metadata: Metadata = {
  title: 'StroopTest Challenge - App', // Differentiate if needed
  description: 'A simple implementation of the Stroop Test, hosted via Firebase.',
};

export default function AppLayout({ // Renamed to AppLayout for clarity, though Next.js uses dir structure
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // This component is now a fragment or a div, not a full HTML document.
    // The AuthProvider is handled by the root layout in /src/app/layout.tsx
    // The main <body> and <html> tags are also handled by the root layout.
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <GlobalNavBar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        {/* Toaster is now handled by the root layout to avoid multiple instances */}
        {/* <Toaster /> */}
        {/* Footer can be specific to this part of the app if needed, or also global */}
    </div>
  );
}
