"use client";

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/'); 
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  // 1. Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <Button variant="outline" disabled className="h-10">Loading...</Button>;
  }

  // 2. Render authenticated user dropdown
  if (isSignedIn && user) {
    // Safely parse name or email fallback
    const userDisplayName = user.fullName || user.primaryEmailAddress?.emailAddress || "User";
    const userEmail = user.primaryEmailAddress?.emailAddress || "";
    const userInitial = userDisplayName[0]?.toUpperCase() || "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.imageUrl} alt={userDisplayName} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userDisplayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 3. Render login/signup action buttons for guests
  return (
    <div className="space-x-2">
      {/* 
        Instead of hard-redirecting, openSignIn() and openSignUp() 
        will open Clerk's modals directly on the page!
      */}
      <Button variant="outline" onClick={() => openSignIn()}>
        Login
      </Button>
      <Button onClick={() => openSignUp()}>
        Sign Up
      </Button>
    </div>
  );
}