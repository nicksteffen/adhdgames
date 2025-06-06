
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';
import { Skeleton } from '@/components/ui/skeleton';
// import ProgressChart from '@/components/dashboard/progress-chart'; // Temporarily removed
// import ScoreTable from '@/components/dashboard/score-table'; // Temporarily removed

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DashboardPage] useEffect triggered. AuthLoading:', authLoading, 'User:', user ? user.uid : 'null');
    if (!authLoading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
      console.log('[DashboardPage] No user and not authLoading. Setting error for login prompt. Current path:', currentPath);
      setError("Access Denied: Please log in to view your dashboard.");
      setLoadingSessions(false); 
      return;
    }

    if (user) {
      console.log('[DashboardPage] User authenticated, fetching sessions for user.uid:', user.uid);
      setLoadingSessions(true);
      setError(null);

      getUserStroopSessions(user.uid)
        .then(response => {
          console.log('[DashboardPage] getUserStroopSessions .then() callback. Raw response object:', response);
          if (response.success && response.data) {
            console.log('[DashboardPage] Successfully fetched sessions. Count:', response.data.length);
            setSessions(response.data);
          } else {
            let errorMessage = "Failed to load sessions.";
            if (typeof response.error === 'string' && response.error) {
              errorMessage = response.error;
            } else if (response.error && typeof response.error === 'object' && Object.keys(response.error).length > 0) {
              // If it's an object, try to stringify it for more info
              try {
                errorMessage = `Details: ${JSON.stringify(response.error)}`;
              } catch (e) {
                errorMessage = "Failed to load sessions. Error object was not serializable.";
              }
            } else if (response.error) {
                errorMessage = "Failed to load sessions. An unknown error structure was received."
            }
            console.error(`[DashboardPage] Failed to load sessions. Error received on client (type: ${typeof response.error}):`, response.error, 'Processed error message:', errorMessage);
            setError(errorMessage);
            setSessions([]);
          }
        })
        .catch(err => {
          console.error("[DashboardPage] getUserStroopSessions .catch() block. Raw error object:", err);
          let displayError = "An unexpected error occurred while fetching sessions.";
          if (err instanceof Error) {
            displayError = err.message;
          } else if (typeof err === 'string' && err) { 
            displayError = err;
          } else {
            try {
              const stringifiedError = JSON.stringify(err);
              if (stringifiedError !== '{}' && stringifiedError) {
                displayError = `Unexpected error structure during fetch: ${stringifiedError}`;
              }
            } catch (e) { /* silent if stringify fails */ }
          }
          console.error('[DashboardPage] Setting error from .catch() to:', displayError);
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

  if (authLoading) {
    console.log('[DashboardPage] Rendering Skeletons (authLoading)');
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

  if (!user && !authLoading) {
    console.log('[DashboardPage] Rendering Access Denied (no user after auth check)');
     return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Please log in to view your dashboard."}</p>
            <Button asChild className="mt-4">
              <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard')}`}>Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  console.log('[DashboardPage] Rendering main content. loadingSessions:', loadingSessions, 'Error:', error, 'Sessions count:', sessions.length);
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
              <CardTitle className="text-2xl text-primary">Session Data</CardTitle>
              <CardDescription>You have {sessions.length} session(s) recorded.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {sessions.map((session) => (
                  <li key={session.id}>
                    ID: {session.id} - Date: {session.timestamp ? new Date(session.timestamp.toDate()).toLocaleString() : 'N/A'}
                  </li>
                ))}
              </ul>
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
