'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUserSessions } from '@/app/actions'; 
import ProgressChart from '@/components/dashboard/progress-chart';
import ScoreTable from '@/components/dashboard/score-table';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/dashboard`);
    } else if (user?.uid) {
      async function loadSessions() {
        try {
          setLoadingSessions(true);
          const response = await fetchUserSessions(user.uid);
          if (response?.success && Array.isArray(response.data)) {
            // Sort sessions by date descending
            const sorted = response.data.sort((a: any, b: any) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setSessions(sorted);
          } else {
            setError(response?.error || "Failed to load session data.");
          }
        } catch (err) {
          setError("An unexpected error occurred.");
        } finally {
          setLoadingSessions(false);
        }
      }
      loadSessions();
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <main className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></main>;
  }

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 bg-muted/20">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Your Dashboard</h1>
            <p className="text-muted-foreground">Monitor your cognitive focus metrics</p>
          </div>
          <Button asChild className="shadow-md">
            <Link href="/tests/stroop">Play Stroop Test</Link>
          </Button>
        </header>

        {loadingSessions ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : error ? (
          <Card className="border-destructive bg-destructive/10 text-center p-6">
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <p className="text-destructive-foreground mt-2">{error}</p>
          </Card>
        ) : (
          <Tabs defaultValue="stroop" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="stroop">Stroop Results</TabsTrigger>
              <TabsTrigger value="nback">N-Back (Coming Soon)</TabsTrigger>
            </TabsList>

            <TabsContent value="stroop" className="space-y-6 mt-6">
              {sessions.length > 0 ? (
                <>
                  <ProgressChart sessions={sessions} />
                  <ScoreTable sessions={sessions} />
                </>
              ) : (
                <Card className="p-12 text-center border-dashed">
                  <h3 className="text-lg font-medium">No Stroop data yet</h3>
                  <p className="text-muted-foreground mb-4">Complete your first session to see results.</p>
                  <Button asChild variant="outline">
                    <Link href="/tests/stroop">Start Stroop Test</Link>
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="nback" className="space-y-6 mt-6">
              <Card className="p-12 text-center border-dashed">
                <h3 className="text-lg font-medium">N-Back Challenge</h3>
                <p className="text-muted-foreground text-sm mt-2">Check back soon for more exercises.</p>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}