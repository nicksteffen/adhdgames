
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthButton from "@/components/auth-button";
// Assuming you might want to test a root-level action as well, or ensure it works.
// If not, this can be removed if your app exclusively uses actions from firebase/hosting/src/app/actions.ts
import { fetchTestDataForUser as fetchTestDataForUserFromRoot } from "@/app/actions"; 
import type { FetchedStroopSession } from "@/lib/firebase/firestore-service";


export default function TestPage() {
  const { user, loading: authLoading } = useAuth();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<FetchedStroopSession[] | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);


  const handleShowUserIdClick = () => {
    if (authLoading) {
      setDisplayMessage("Checking authentication status...");
    } else if (user) {
      setDisplayMessage(`User ID: ${user.uid}`);
    } else {
      setDisplayMessage("Not Logged In");
    }
  };

  const handleFetchDataClick = async () => {
    if (!user) {
      setDataError("You must be logged in to fetch data.");
      setFetchedData(null);
      return;
    }
    setDataLoading(true);
    setDataError(null);
    setFetchedData(null);
    try {
      // This now calls the action from the root src/app/actions.ts
      const response = await fetchTestDataForUserFromRoot(user.uid); 
      if (response.success && response.data) {
        setFetchedData(response.data);
      } else {
        setDataError(response.error || "Failed to fetch data from root action.");
      }
    } catch (error: any) {
      setDataError(error.message || "An unexpected error occurred with root action.");
    }
    setDataLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <h1> SRC PAGE </h1>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-primary">(Root) Auth & Data Test Page</CardTitle>
          <CardDescription className="text-center">Test authentication and user-specific data fetching using root actions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="mb-4">
            <AuthButton />
          </div>
          <Button 
            onClick={handleShowUserIdClick} 
            disabled={authLoading}
            className="w-full"
          >
            {authLoading ? "Loading Auth..." : "Show User Status"}
          </Button>
          
          {displayMessage && (
            <div className="mt-4 p-3 bg-muted rounded-md text-center w-full">
              <p className="text-sm font-medium text-foreground">{displayMessage}</p>
            </div>
          )}

          <Button
            onClick={handleFetchDataClick}
            disabled={authLoading || !user || dataLoading}
            className="w-full"
          >
            {dataLoading ? "Fetching Data (Root Action)..." : "Fetch My Stroop Data (Root Action)"}
          </Button>

          {dataLoading && <p className="text-sm text-muted-foreground">Loading data...</p>}
          {dataError && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-md text-center w-full">
              <p className="text-sm font-medium text-destructive">{dataError}</p>
            </div>
          )}
          {fetchedData && (
             <Card className="mt-4 w-full">
              <CardHeader>
                <CardTitle className="text-lg">Fetched Stroop Sessions ({fetchedData.length}) (Root)</CardTitle>
              </CardHeader>
              <CardContent>
                {fetchedData.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {fetchedData.map((session) => (
                      <li key={session.id}>
                        ID: {session.id.substring(0, 8)}... - Score (R1): {session.round1Score ?? 'N/A'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No sessions found for this user.</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

    