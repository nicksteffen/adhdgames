
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
  const [user, setUser] = useState<User | null>({ uid: 'stubbed-user', email: 'stub@example.com' } as unknown as User);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Stubbed out firebase onAuthStateChanged
  }, []);

  const signUp = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    setTimeout(() => {
      setUser({ uid: 'stubbed-user', email: values.email } as unknown as User);
      setLoading(false);
    }, 500);
    return { success: true };
  };

  const logIn = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setTimeout(() => {
      setUser({ uid: 'stubbed-user', email: values.email } as unknown as User);
      setLoading(false);
    }, 500);
    return { success: true };
  };

  const logOut = async () => {
    setLoading(true);
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 500);
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
