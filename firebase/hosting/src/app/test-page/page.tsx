
"use client";

import { useState } from "react"; // Corrected import
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
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
