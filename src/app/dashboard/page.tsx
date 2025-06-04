
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';
import ScoreTable from '@/components/dashboard/score-table';
import ProgressChart from '@/components/dashboard/progress-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter(); // Keep router for navigation if needed, but remove from effect deps if not used there
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login if not authenticated and auth is resolved
      // Pass current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      console.log('[DashboardPage] User authenticated, fetching sessions for user.uid:', user.uid);
      setLoadingSessions(true);
      setError(null);
      console.log('[DashboardPage] Calling getUserStroopSessions...');

      const promise = getUserStroopSessions(user.uid);
      console.log('[DashboardPage] getUserStroopSessions promise obtained.');

      promise.then(response => {
          console.log('[DashboardPage] getUserStroopSessions .then() callback. Response success:', response.success);
          if (response.success && response.data) {
            console.log('[DashboardPage] Successfully fetched sessions. Count:', response.data.length);
            // Sort sessions by timestamp client-side if orderBy was removed from query
            const sortedSessions = response.data.sort((a, b) => {
              const dateA = a.timestamp?.toDate()?.getTime() || 0;
              const dateB = b.timestamp?.toDate()?.getTime() || 0;
              return dateB - dateA; // Descending order (newest first)
            });
            setSessions(sortedSessions);
          } else {
            console.error('[DashboardPage] Failed to load sessions from response. Error object:', response.error);
            setError(response.error?.message || "Failed to load sessions.");
            setSessions([]);
          }
        })
        .catch(err => {
          console.error("[DashboardPage] getUserStroopSessions .catch() block. Error object:", err);
          setError("An unexpected error occurred while fetching data.");
          setSessions([]);
        })
        .finally(() => {
          console.log("[DashboardPage] getUserStroopSessions .finally() block.");
          setLoadingSessions(false);
        });
    } else if (!authLoading && !user) {
        // This log might appear briefly if the redirect effect hasn't kicked in yet
        console.log('[DashboardPage] No user, not fetching sessions. Auth loading:', authLoading);
        setLoadingSessions(false); // Ensure loading is false if no user
        setSessions([]); // Clear sessions if no user
    }
  }, [user, authLoading]); // Removed router from this effect's dependencies

  if (authLoading || (!user && typeof window !== 'undefined' && window.location.pathname === '/dashboard')) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
        <Skeleton className="h-12 w-1/4 mb-6" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  // This check should ideally be caught by the redirect earlier, but as a fallback or during transition
  if (!user) {
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
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 bg-muted/20">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Your Dashboard</h1>
            <p className="text-lg text-muted-foreground">Track your Stroop Test progress.</p>
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
             <Card>
              <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
              <CardContent><Skeleton className="h-72 w-full" /></CardContent>
            </Card>
           </div>
        )}

        {!loadingSessions && error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
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
          <>
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Performance Charts</CardTitle>
                <CardDescription>Visualizing your scores and response times over sessions.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart sessions={sessions} />
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Session History</CardTitle>
                <CardDescription>Detailed results from your past Stroop Test sessions.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreTable sessions={sessions} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StroopTest Challenge. All rights reserved.</p>
      </footer>
    </main>
  );
}
