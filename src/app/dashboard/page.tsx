
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
  const router = useRouter();
  const [sessions, setSessions] = useState<FetchedStroopSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      console.log('[DashboardPage] User authenticated, fetching sessions for user.uid:', user.uid);
      setLoadingSessions(true);
      setError(null);
      getUserStroopSessions(user.uid)
        .then(response => {
          if (response.success && response.data) {
            console.log('[DashboardPage] Successfully fetched sessions:', response.data.length);
            setSessions(response.data);
          } else {
            console.error('[DashboardPage] Failed to load sessions:', response.error);
            setError(response.error?.message || "Failed to load sessions.");
            setSessions([]); // Clear sessions on error
          }
        })
        .catch(err => {
          console.error("[DashboardPage] Error fetching sessions (catch block):", err);
          setError("An unexpected error occurred while fetching data.");
          setSessions([]);
        })
        .finally(() => {
          setLoadingSessions(false);
        });
    } else if (!authLoading && !user) {
        // If no user and auth is done loading, don't attempt to load sessions, auth effect will redirect
        console.log('[DashboardPage] No user, not fetching sessions.');
        setLoadingSessions(false);
        setSessions([]);
    }
  }, [user, authLoading]);

  if (authLoading || (!user && typeof window !== 'undefined' && window.location.pathname === '/dashboard')) {
    // Show skeleton loader while auth is resolving or if user is null and we are on dashboard
    // (prevents flash of "please log in" if redirect is about to happen)
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

  if (!user) {
     // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view your dashboard.</p>
            <Button asChild className="mt-4">
              <Link href="/login?redirect=/dashboard">Login</Link>
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
              {/* Removed retry button for now to simplify, can be added back */}
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

