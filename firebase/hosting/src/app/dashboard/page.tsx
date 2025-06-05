
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';
import { Skeleton } from '@/components/ui/skeleton';
// import ProgressChart from '@/components/dashboard/progress-chart'; // Intentionally commented out
// import ScoreTable from '@/components/dashboard/score-table'; // Intentionally commented out

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DashboardPage] useEffect triggered. AuthLoading:', authLoading, 'User:', user ? user.uid : 'null');
    if (!authLoading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
      console.log('[DashboardPage] No user and not authLoading. Path for potential redirect (not auto-redirecting now):', currentPath);
      // No automatic redirect here, UI will handle showing login prompt.
    } else if (user) {
      console.log('[DashboardPage] User authenticated, fetching sessions for user.uid:', user.uid);
      setLoadingSessions(true);
      setError(null);
      
      console.log('[DashboardPage] Calling getUserStroopSessions...');
      const promise = getUserStroopSessions(user.uid);
      console.log('[DashboardPage] getUserStroopSessions promise obtained.');

      promise.then(response => {
          console.log('[DashboardPage] getUserStroopSessions .then() callback. Response object:', response);
          if (response.success && response.data) {
            console.log('[DashboardPage] Successfully fetched sessions. Count:', response.data.length);
            setSessions(response.data);
            setError(null);
          } else {
            // Ensure response.error is a string for setError.
            // firestore-service.ts should now always return a string error if !response.success
            const errorMessage = typeof response.error === 'string' ? response.error : "Failed to load sessions. An unknown error occurred.";
            console.error('[DashboardPage] Failed to load sessions from response. Error:', errorMessage);
            setError(errorMessage);
            setSessions([]);
          }
        })
        .catch(err => {
          console.error("[DashboardPage] getUserStroopSessions .catch() block. Error object:", err);
          let displayError = "An unexpected error occurred during fetch.";
          if (err instanceof Error) {
            displayError = err.message;
          } else if (typeof err === 'string') {
            displayError = err;
          } else {
            try {
              const stringifiedError = JSON.stringify(err);
              if (stringifiedError !== '{}' && stringifiedError) {
                displayError = `Unexpected error details: ${stringifiedError}`;
              }
            } catch (e) {
              // silent
            }
          }
          console.log('[DashboardPage] Setting error state from .catch() to:', displayError);
          setError(displayError);
          setSessions([]);
        })
        .finally(() => {
          console.log("[DashboardPage] getUserStroopSessions .finally() block.");
          setLoadingSessions(false);
        });
    } else if (authLoading) {
        console.log('[DashboardPage] Auth is loading, waiting to fetch sessions.');
        setLoadingSessions(true);
    }
  }, [user, authLoading]);

  if (authLoading || (!user && typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard'))) {
    console.log('[DashboardPage] Rendering Skeletons (authLoading or initial dashboard load without user determined)');
    return (
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
        <Skeleton className="h-12 w-1/4 mb-6" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    );
  }

  if (!user) {
    console.log('[DashboardPage] Rendering Access Denied (no user after auth check)');
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view your dashboard.</p>
            <Button asChild className="mt-4">
              <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard')}`}>Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  console.log('[DashboardPage] Rendering main content. User is authenticated. loadingSessions:', loadingSessions, 'Error:', error, 'Sessions count:', sessions.length);
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 bg-muted/20">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Your Dashboard</h1>
            <p className="text-lg text-muted-foreground">Your Stroop Test Progress</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Play Stroop Test</Link>
          </Button>
        </header>

        {loadingSessions && (
           <div className="space-y-6">
            <Card>
              <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
              <CardContent><Skeleton className="h-40 w-full" /></CardContent>
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
            </CardContent>
          </Card>
        )}

        {!loadingSessions && !error && sessions.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Data Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You haven&apos;t completed any Stroop Test sessions yet.</p>
              <p className="text-muted-foreground">Play a game to see your results here!</p>
              <Button asChild className="mt-4">
                <Link href="/">Play Stroop Test</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loadingSessions && !error && sessions.length > 0 && (
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Session Data (Raw)</CardTitle>
              <CardDescription>List of your session IDs and timestamps. (Table & Charts to be re-added)</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Found {sessions.length} session(s).</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {sessions.map((session) => (
                  <li key={session.id}>
                    ID: {session.id} - Date: {session.timestamp ? new Date(session.timestamp.toDate()).toLocaleString() : 'N/A'}
                  </li>
                ))}
              </ul>
              {/* <ProgressChart sessions={sessions} /> */}
              {/* <ScoreTable sessions={sessions} /> */}
            </CardContent>
          </Card>
        )}
      </div>
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StroopTest Challenge. All rights reserved.</p>
      </footer>
    </main>
  );
}
