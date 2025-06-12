
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context'; // Resolves to firebase/hosting/src/contexts/auth-context
import GlobalNavBar from '@/components/global-nav-bar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StroopTest Challenge - App',
  description: 'A simple implementation of the Stroop Test, hosted via Firebase.',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <GlobalNavBar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
