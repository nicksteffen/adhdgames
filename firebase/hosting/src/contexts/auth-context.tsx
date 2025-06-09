
"use client";

import type { User, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import type { z } from 'zod';
import type { loginSchema, signupSchema } from '@/lib/schemas/auth-schemas';
import { useToast } from "@/hooks/use-toast";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (values: z.infer<typeof signupSchema>) => Promise<{ success: boolean; error?: AuthError }>;
  logIn: (values: z.infer<typeof loginSchema>) => Promise<{ success: boolean; error?: AuthError }>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      toast({
        title: "Sign Up Failed",
        description: (error as AuthError).message || "An unknown error occurred.",
        variant: "destructive",
      });
      return { success: false, error: error as AuthError };
    }
  };

  const logIn = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: (error as AuthError).message || "An unknown error occurred.",
        variant: "destructive",
      });
      return { success: false, error: error as AuthError };
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
       toast({
        title: "Logout Failed",
        description: (error as AuthError).message || "An unknown error occurred.",
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
