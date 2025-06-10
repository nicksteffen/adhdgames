
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// AuthButton is now in the GlobalNavBar
// import AuthButton from "@/components/auth-button"; 
import { fetchTestDataForUser, addMockStroopSessionForUser, testAdminSDKConnection } from "@/app/actions"; 
import type { FetchedStroopSession } from "@/lib/firebase/firestore-service";
import { useToast } from "@/hooks/use-toast";


export default function TestPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<FetchedStroopSession[] | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [mockDataLoading, setMockDataLoading] = useState(false);
  const [adminSDKTestResult, setAdminSDKTestResult] = useState<string | null>(null);
  const [adminSDKTestLoading, setAdminSDKTestLoading] = useState(false);

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
      const response = await fetchTestDataForUser(user.uid);
      if (response.success && response.data) {
        setFetchedData(response.data);
        setDataError(null); 
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : 'Failed to fetch data.';
        setDataError(errorMsg);
        setFetchedData(null);
      }
    } catch (error: any) {
      setDataError(error.message || "An unexpected error occurred.");
      setFetchedData(null);
    }
    setDataLoading(false);
  };

  const handleAddMockDataClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add mock data.",
        variant: "destructive",
      });
      return;
    }
    setMockDataLoading(true);
    setDataError(null); 
    try {
      const response = await addMockStroopSessionForUser(user.uid);
      if (response.success) {
        toast({
          title: "Mock Data Added",
          description: `Session ID: ${response.sessionId} created for user ${user.uid}. Refreshing data...`,
        });
        await handleFetchDataClick(); 
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error as any)?.message || "An unknown error occurred while adding mock data.";
        setDataError(errorMessage); 
        toast({
          title: "Failed to Add Mock Data",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred while adding mock data.";
      setDataError(errorMessage); 
      toast({
        title: "Error Adding Mock Data",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setMockDataLoading(false);
  };

  const handleTestAdminSDKConnection = async () => {
    setAdminSDKTestLoading(true);
    setAdminSDKTestResult(null);
    try {
      const result = await testAdminSDKConnection();
      setAdminSDKTestResult(`Success: ${result.success}. Message: ${result.message}${result.data ? ` Details: ${JSON.stringify(result.data)}` : ''}`);
    } catch (error: any) {
      setAdminSDKTestResult(`Test failed: ${error.message || "Unknown error"}`);
    }
    setAdminSDKTestLoading(false);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-primary">Auth & Data Test Page (Hosting)</CardTitle>
          <CardDescription className="text-center">Test authentication and user-specific data fetching.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
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
            onClick={handleTestAdminSDKConnection}
            disabled={adminSDKTestLoading}
            variant="secondary"
            className="w-full"
          >
            {adminSDKTestLoading ? "Testing Admin SDK..." : "Test Admin SDK Connection"}
          </Button>
          {adminSDKTestResult && (
            <div className={`mt-2 p-2 rounded-md text-xs w-full text-center ${adminSDKTestResult.startsWith("Success: true") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <pre className="whitespace-pre-wrap">{adminSDKTestResult}</pre>
            </div>
          )}


          <Button
            onClick={handleFetchDataClick}
            disabled={authLoading || !user || dataLoading}
            className="w-full"
          >
            {dataLoading ? "Fetching Data..." : "Fetch My Stroop Data (Hosting Action)"}
          </Button>

          <Button
            onClick={handleAddMockDataClick}
            disabled={authLoading || !user || mockDataLoading || dataLoading}
            variant="outline"
            className="w-full"
          >
            {mockDataLoading ? "Adding Mock Data..." : "Add Mock Session Data"}
          </Button>

          {dataLoading && <p className="text-sm text-muted-foreground">Loading data...</p>}
          
          {dataError && !dataLoading && ( 
            <div className="mt-4 p-3 bg-destructive/10 rounded-md text-center w-full">
              <p className="text-sm font-medium text-destructive">{dataError}</p>
            </div>
          )}

          {fetchedData && !dataLoading && (
            <Card className="mt-4 w-full">
              <CardHeader>
                <CardTitle className="text-lg">Fetched Stroop Sessions ({fetchedData.length})</CardTitle>
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
