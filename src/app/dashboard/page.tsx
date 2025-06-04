
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter(); // Keep router for potential future redirect logic
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DashboardPage] useEffect triggered. AuthLoading:', authLoading, 'User:', user ? user.uid : 'null');
    if (!authLoading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
      console.log('[DashboardPage] No user and not authLoading. Redirecting to login from path:', currentPath);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
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
            console.log('[DashboardPage] Successfully fetched sessions. Count:', response.data.length, 'Data:', response.data);
            setSessions(response.data);
          } else {
            console.error('[DashboardPage] Failed to load sessions from response. Error object:', response.error);
            setError(response.error?.message || response.error || "Failed to load sessions.");
            setSessions([]);
          }
        })
        .catch(err => {
          console.error("[DashboardPage] getUserStroopSessions .catch() block. Error object:", err);
          setError(err.message || "An unexpected error occurred while fetching data.");
          setSessions([]);
        })
        .finally(() => {
          console.log("[DashboardPage] getUserStroopSessions .finally() block.");
          setLoadingSessions(false);
        });
    } else if (authLoading) {
        console.log('[DashboardPage] Auth is loading, waiting to fetch sessions.');
        setLoadingSessions(true); // Keep loading true while auth is resolving
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard'))) {
    // Show skeletons if auth is loading OR if we're on dashboard and user is not yet determined (to avoid flash of Access Denied)
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
    // This case should ideally be handled by the redirect, but as a fallback:
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
  
  // User is authenticated, proceed to render dashboard content
  console.log('[DashboardPage] User is authenticated. loadingSessions:', loadingSessions, 'Error:', error, 'Sessions count:', sessions.length);
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
              <p className="text-destructive-foreground">Details: {typeof error === 'object' ? JSON.stringify(error) : error}</p>
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
