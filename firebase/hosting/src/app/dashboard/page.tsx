
"use client"; 

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type FetchedStroopSession } from '@/lib/firebase/firestore-service';
import { fetchUserSessions } from '@/app/actions'; 
import ProgressChart from '@/components/dashboard/progress-chart';
import ScoreTable from '@/components/dashboard/score-table';


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else if (user && user.uid) {
      setLoadingSessions(true);
      setError(null);
      
      async function loadSessions() {
        const response = await fetchUserSessions(user.uid);
        if (response && typeof response === 'object' && 'success' in response) {
          if (response.success && response.data) {
            setSessions(response.data);
            setError(null); 
          } else {
            let displayError = "Failed to load sessions. Unknown error.";
            if (typeof response.error === 'string' && response.error) {
              displayError = response.error;
            } else if (response.error && typeof (response.error as any).message === 'string') {
              displayError = (response.error as any).message;
            }
            setError(displayError);
            setSessions([]);
          }
        } else {
            setError("Received an unexpected response structure from the server.");
            setSessions([]);
        }
        setLoadingSessions(false);
      }

      loadSessions().catch(err => {
          let displayError = "An unexpected error occurred while fetching sessions.";
          if (err instanceof Error) {
            displayError = err.message;
          }
          setError(displayError);
          setSessions([]);
          setLoadingSessions(false);
        });
    } else if (authLoading) {
      setLoadingSessions(true); 
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading) /* Wait for redirect or auth load */) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 bg-muted/20">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">Your Dashboard</h1>
            <p className="text-lg text-muted-foreground">Track your Stroop Test Progress</p>
          </div>
          <Button asChild variant="default" className="mt-4 sm:mt-0 shadow-md">
            <Link href="/">Play New Game</Link>
          </Button>
        </header>

        {loadingSessions && (
          <div className="space-y-6">
            <Card>
              <CardHeader><Skeleton className="h-8 w-1/3 rounded-md" /></CardHeader>
              <CardContent><Skeleton className="h-40 w-full rounded-md" /></CardContent>
            </Card>
             <Card>
              <CardHeader><Skeleton className="h-8 w-1/3 rounded-md" /></CardHeader>
              <CardContent><Skeleton className="h-60 w-full rounded-md" /></CardContent>
            </Card>
           </div>
        )}

        {!loadingSessions && error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">Details: {error}</p>
              <Button onClick={() => router.refresh()} variant="outline" className="mt-4">Try Reloading Page</Button>
            </CardContent>
          </Card>
        )}

        {!loadingSessions && !error && sessions.length === 0 && (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="text-2xl">No Data Yet!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t completed any Stroop Test sessions.
                <br />
                Play a game to see your results populate here.
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link href="/">Start Your First Stroop Test</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loadingSessions && !error && sessions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1"> {/* Changed grid to single column for better flow */}
            <ProgressChart sessions={sessions} />
            <ScoreTable sessions={sessions} />
          </div>
        )}
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground py-4 border-t">
        <p>&copy; {new Date().getFullYear()} StroopTest Challenge. All rights reserved.</p>
      </footer>
    </main>
  );
}
