"use client"
import LandingPage from "@/components/landing-page";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  // // If the user is logged in, send them straight to the dashboard
  if (isSignedIn && isLoaded) {
    redirect("/dashboard"); 
  }

  // If not logged in, show the beautiful landing page
  return <LandingPage />;
}