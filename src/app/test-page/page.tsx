"use client";

import { fetchUserSessions, getUserId } from "../actions";
import { useState } from "react";

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleButtonClick = async () => {
    console.log("Calling fetchUserSessions server action...");
    setIsLoading(true);
    await fetchUserSessions();
    const id = await getUserId();
    setUserId(id);
    setIsLoading(false);
    console.log("fetchUserSessions server action returned.");
  };

  // You can display the userId here

  return (
    <div>
      <h1>Test Page</h1>
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch User Sessions"}
      </button>
    </div>
    {userId && <p>User ID: {userId}</p>}
  );
}