"use client";

import { fetchUserSessions } from "../actions";
import { useState } from "react";

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = async () => {
    console.log("Calling fetchUserSessions server action...");
    setIsLoading(true);
    await fetchUserSessions();
    setIsLoading(false);
    console.log("fetchUserSessions server action returned.");
  };

  return (
    <div>
      <h1>Test Page</h1>
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch User Sessions"}
      </button>
    </div>
  );
}