
"use client";

import type { User, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/config'; // Updated import
import type { z } from 'zod';
import type { loginSchema, signupSchema } from '@/lib/schemas/auth-schemas';
import { useToast } from "@/hooks/use-toast";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (values: z.infer<typeof signupSchema>) => Promise<{ success: boolean; error?: string }>; // error as string
  logIn: (values: z.infer<typeof loginSchema>) => Promise<{ success: boolean; error?: string }>; // error as string
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const auth = getClientAuth(); // Get auth instance
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      const auth = getClientAuth();
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      toast({
        title: "Sign Up Failed",
        description: authError.message || "An unknown error occurred.",
        variant: "destructive",
      });
      return { success: false, error: authError.message };
    }
  };

  const logIn = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      toast({
        title: "Login Failed",
        description: authError.message || "An unknown error occurred.",
        variant: "destructive",
      });
      return { success: false, error: authError.message };
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      const auth = getClientAuth();
      await signOut(auth);
      setUser(null); // Clear user state immediately
    } catch (error) {
       const authError = error as AuthError;
       toast({
        title: "Logout Failed",
        description: authError.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
