
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';
import { Skeleton } from '@/components/ui/skeleton';
// import ProgressChart from '@/components/dashboard/progress-chart';
// import ScoreTable from '@/components/dashboard/score-table';

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
      setError("Access Denied: Please log in to view your dashboard."); // User will be shown login prompt by UI logic below
      setLoadingSessions(false);
      return;
    }

    if (user) {
      console.log('[DashboardPage] User authenticated, attempting to fetch sessions for user.uid:', user.uid);
      setLoadingSessions(true);
      setError(null);
      
      const promise = getUserStroopSessions(user.uid);
      console.log('[DashboardPage] getUserStroopSessions promise obtained.');

      promise.then(response => {
          console.log('[DashboardPage] getUserStroopSessions .then() callback. Full raw response object from server:', JSON.stringify(response));
          
          if (response && response.success && response.data) {
            console.log('[DashboardPage] Successfully fetched sessions. Count:', response.data.length);
            setSessions(response.data);
            setError(null);
          } else {
            let errorMessageToSet = "Failed to load sessions. An unspecified error occurred on the server.";
            if (response && response.error) {
              if (typeof response.error === 'string' && response.error.trim() !== "") {
                errorMessageToSet = response.error;
              } else if (typeof response.error === 'object' && Object.keys(response.error).length > 0) {
                // If it's an object (like {} if stringification failed earlier or was empty)
                errorMessageToSet = `Failed to load sessions. Server error details: ${JSON.stringify(response.error)}`;
              } else {
                errorMessageToSet = "Failed to load sessions. Server returned an unspecified error or empty error object.";
              }
            } else if (response && response.success === false) { // Explicitly check for success: false
                 errorMessageToSet = "Failed to load sessions. Server indicated failure without a specific error message.";
            } else if (!response) {
                errorMessageToSet = "Failed to load sessions. No response received from server.";
            }

            console.error('[DashboardPage] Error condition met. Full server response for debugging:', JSON.stringify(response), '. Error message set for UI:', errorMessageToSet);
            setError(errorMessageToSet);
            setSessions([]);
          }
        })
        .catch(err => {
          console.error("[DashboardPage] Exception during getUserStroopSessions call (e.g. network error, or server action threw unhandled). Error object:", err);
          let displayError = "An unexpected error occurred while initiating session fetch.";
          if (err instanceof Error) {
            displayError = err.message;
          } else if (typeof err === 'string' && err) {
            displayError = err;
          } else {
            try {
              const stringifiedError = JSON.stringify(err);
              if (stringifiedError !== '{}' && stringifiedError) {
                displayError = `Unexpected error structure during fetch initiation: ${stringifiedError}`;
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
    console.log('[DashboardPage] Rendering Skeletons (authLoading is true)');
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

  if (!user && !authLoading) { // Ensure auth is not loading before showing login prompt
    console.log('[DashboardPage] Rendering Access Denied (no user and auth not loading)');
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
  
  // This part renders if user is authenticated
  console.log('[DashboardPage] Rendering main dashboard content. loadingSessions:', loadingSessions, 'Error state:', error, 'Sessions count:', sessions.length);
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
              <CardDescription>You have {sessions.length} session(s) recorded (IDs shown).</CardDescription>
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

