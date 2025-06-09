
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import GlobalNavBar from '@/components/global-nav-bar'; // Import the new component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StroopTest Challenge',
  description: 'A simple implementation of the Stroop Test.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <GlobalNavBar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Toaster />
          {/* You could add a global footer here if desired later on */}
          {/* <footer className="py-4 text-center text-sm text-muted-foreground border-t mt-auto">
            © {new Date().getFullYear()} StroopApp
          </footer> */}
        </AuthProvider>
      </body>
    </html>
  );
}
