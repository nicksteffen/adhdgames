"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs"; // Updated import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTestDataForUser, addMockStroopSessionForUser, testAdminSDKConnection } from "@/app/actions"; 
import type { FetchedStroopSession } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export default function TestPage() {
  const { user, isLoaded } = useUser(); // Clerk's standard hook
  const { toast } = useToast();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<FetchedStroopSession[] | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [mockDataLoading, setMockDataLoading] = useState(false);

  const handleShowUserIdClick = () => {
    if (!isLoaded) {
      setDisplayMessage("Checking authentication status...");
    } else if (user) {
      setDisplayMessage(`User ID: ${user.id}`); // Clerk uses .id
    } else {
      setDisplayMessage("Not Logged In");
    }
  };

  const handleFetchDataClick = async () => {
    if (!user) {
      setDataError("You must be logged in to fetch data.");
      return;
    }
    setDataLoading(true);
    setDataError(null); 
    setFetchedData(null); 
    try {
      const response = await fetchTestDataForUser(user.id); // Use user.id
      if (response.success && response.data) {
        setFetchedData(response.data);
      } else {
        setDataError(typeof response.error === 'string' ? response.error : 'Failed to fetch data.');
      }
    } catch (error: any) {
      setDataError(error.message || "An unexpected error occurred.");
    }
    setDataLoading(false);
  };

  const handleAddMockDataClick = async () => {
    if (!user) return;
    
    setMockDataLoading(true);
    try {
      const response = await addMockStroopSessionForUser(user.id); // Use user.id
      if (response.success) {
        toast({
          title: "Mock Data Added",
          description: `Session ID: ${response.sessionId} created.`,
        });
        await handleFetchDataClick(); 
      } else {
        throw new Error(typeof response.error === 'string' ? response.error : "Failed to add mock data.");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setMockDataLoading(false);
  };

  const handleTestAdminSDKConnection = async () => {
    setAdminSDKTestLoading(true);
    try {
      const result = await testAdminSDKConnection();
      const res = result as any;
      setAdminSDKTestResult(`Success: ${res.success}. Message: ${res.message}`);
    } catch (error: any) {
      setAdminSDKTestResult(`Test failed: ${error.message}`);
    }
    setAdminSDKTestLoading(false);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-primary">Auth & Data Test Page</CardTitle>
          <CardDescription className="text-center">Clerk + Turso Connection Test</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <Button onClick={handleShowUserIdClick} disabled={!isLoaded} className="w-full">
            Show User Status
          </Button>
          
          {displayMessage && (
            <div className="mt-4 p-3 bg-muted rounded-md text-center w-full text-sm">
              {displayMessage}
            </div>
          )}


          <Button onClick={handleFetchDataClick} disabled={!isLoaded || !user || dataLoading} className="w-full">
            Fetch My Stroop Data
          </Button>

          <Button onClick={handleAddMockDataClick} disabled={!isLoaded || !user || mockDataLoading} variant="outline" className="w-full">
            Add Mock Session Data
          </Button>
          
          {/* ... (rest of your result rendering remains the same) */}
        </CardContent>
      </Card>
    </main>
  );
}