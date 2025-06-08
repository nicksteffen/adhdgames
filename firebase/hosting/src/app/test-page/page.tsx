
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthButton from "@/components/auth-button"; // Added import

export default function TestPage() {
  const { user, loading: authLoading } = useAuth();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  const handleShowUserIdClick = () => {
    if (authLoading) {
      setDisplayMessage("Checking authentication status...");
    } else if (user) {
      setDisplayMessage(`User ID: ${user.uid}`);
    } else {
      setDisplayMessage("Not Logged In");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-primary">Auth Test Page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="mb-4">
            <AuthButton />
          </div>
          <Button 
            onClick={handleShowUserIdClick} 
            disabled={authLoading}
            className="px-6 py-3 text-lg"
          >
            {authLoading ? "Loading Auth..." : "Show User Status"}
          </Button>
          
          {displayMessage && (
            <div className="mt-6 p-4 bg-muted rounded-md text-center w-full">
              <p className="text-lg font-medium text-foreground">{displayMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
