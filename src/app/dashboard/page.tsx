
"use client"; // Keep this as it's a client component for now, but data fetching is server-side

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service'; // No longer used client-side
import { Skeleton } from '@/components/ui/skeleton';
import { type FetchedStroopSession } from '@/lib/firebase/firestore-service'; // Still need the type
import { fetchUserSessions } from '@/app/actions'; // Import the server action

// import ProgressChart from '@/components/dashboard/progress-chart';
// import ScoreTable from '@/components/dashboard/score-table';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true); // Still manage loading state client-side for the fetch call
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DashboardPage] useEffect triggered. AuthLoading:', authLoading, 'User:', user ? user.uid : 'null');

    if (!authLoading && !user) {
      // Redirect unauthenticated users
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
      console.log('[DashboardPage] No user and not authLoading. Redirecting to login from path:', currentPath);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else if (user) {
      console.log('[DashboardPage] User authenticated, fetching sessions for user.uid:', user.uid);
      setLoadingSessions(true);
      setError(null);
      
      // Call the server action to fetch data
      async function loadSessions() {
        console.log('[DashboardPage] Calling server action fetchUserSessions...');
        const response = await fetchUserSessions();
        console.log('[DashboardPage] Server action response:', response);

        if (response.success && response.data) {
          console.log('[DashboardPage] Successfully fetched sessions via server action. Count:', response.data.length);
          setSessions(response.data);
          setError(null);
        } else {
          console.error('[DashboardPage] Failed to load sessions via server action. Error:', response.error);
          let displayError = "Failed to load sessions.";
          if (response.error) {
            displayError = response.error; // Assuming server action returns a user-friendly string error
          }
          setError(displayError);
          setSessions([]);
        }
        setLoadingSessions(false);
      }

      loadSessions().catch(err => {
          console.error("[DashboardPage] Error calling server action fetchUserSessions:", err);
          let displayError = "An unexpected error occurred while fetching sessions.";
          if (err instanceof Error) {
            displayError = err.message;
          }
          setError(displayError);
          setSessions([]);
          setLoadingSessions(false);
        });
    } else if (authLoading) {
      console.log('[DashboardPage] Auth is loading, waiting to fetch sessions.');
      setLoadingSessions(true); // Keep loading true while auth is resolving
    }
  }, [user, authLoading, router]); // Include router in deps as it's used for push

  console.log('[DashboardPage] User is authenticated. loadingSessions:', loadingSessions, 'Error:', error, 'Sessions count:', sessions.length);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 bg-muted/20">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Your Dashboard</h1>
            <p className="text-lg text-muted-foreground">Your Stroop Test Progress</p>
          </div>
          <Button asChild variant="outline" className="mt-4 sm:mt-0">
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
              <p className="text-muted-foreground mb-4">Play a game to see your results here!</p>
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
              <CardDescription>List of your session IDs and timestamps.</CardDescription>
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
              {/* We will add back ProgressChart and ScoreTable here in the next steps */}
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

