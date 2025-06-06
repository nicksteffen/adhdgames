
"use client";

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view the dashboard.</p>
            <Button asChild className="mt-4">
              <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard')}`}>Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 bg-muted/20">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
            <p className="text-lg text-muted-foreground">Welcome to your dashboard. Ready to rebuild!</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Play Stroop Test</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Content Area</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is where the new dashboard content will go.</p>
          </CardContent>
        </Card>
        
      </div>
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StroopTest Challenge. All rights reserved.</p>
      </footer>
    </main>
  );
}
