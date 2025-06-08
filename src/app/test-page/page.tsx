
"use client";

import { fetchUserSessions, getUserId } from "../actions";
import { useState } from "react";

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleButtonClick = async () => {
    console.log("Calling fetchUserSessions server action...");
    setIsLoading(true);
    // Note: The fetchUserSessions and getUserId actions would also need to be correctly defined
    // for this version of the page to fully work.
    // For now, this just fixes the JSX parsing error.
    try {
      // Assuming these are valid server actions for the purpose of this test page.
      // In a real scenario, you'd want to ensure they are correctly implemented
      // and handle their responses.
      await fetchUserSessions(); 
      const id = await getUserId(); 
      setUserId(id);
    } catch (error) {
      console.error("Error in test page button click:", error);
      // Handle or display error as needed
    }
    setIsLoading(false);
    console.log("fetchUserSessions server action returned.");
  };

  return (
    <>
      <div>
        <h1>Test Page</h1>
        <button onClick={handleButtonClick} disabled={isLoading}>
          {isLoading ? "Loading..." : "Fetch User Sessions"}
        </button>
      </div>
      {userId && <p>User ID: {userId}</p>}
    </>
  );
}
