"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  is_admin: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Session user found:", session.user.email);
          
          // Fetch admin status from users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();

          console.log("User data fetched:", { userData, error, userId: session.user.id });

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            phone: session.user.user_metadata?.phone || "",
            is_admin: userData?.is_admin || false,
          });

          console.log("User state set with is_admin:", userData?.is_admin || false);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth state changes but use cached data when possible
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session?.user) {
          // Keep existing user data to avoid re-fetching unnecessarily
          setUser((prevUser) => 
            prevUser?.id === session.user.id
              ? prevUser // Return cached data if same user
              : {
                  id: session.user.id,
                  email: session.user.email || "",
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
                  phone: session.user.user_metadata?.phone || "",
                  is_admin: false, // Will be updated on next load
                }
          );
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Also insert into users table for admin features
      const { error: dbError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        phone,
      });

      if (dbError) console.error("DB insert error:", dbError);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Don't wait, just let the auth state update naturally
      return data;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
