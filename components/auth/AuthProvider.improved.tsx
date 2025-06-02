"use client";

import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { User as DbUser } from "@/types/blog";

type AuthContextType = {
  session: Session | null;
  user: (User & Partial<DbUser>) | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<(User & Partial<DbUser>) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = useCallback(
    async (authUser: User) => {
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError) {
          console.warn(
            "User profile not found, might be newly created:",
            userError.message
          );
          // For new users, the profile might not exist yet
          return {
            ...authUser,
            role: "author", // Default role
            username: authUser.email?.split("@")[0] || "",
            full_name: authUser.user_metadata?.full_name || "",
          };
        }

        return {
          ...authUser,
          ...userData,
        };
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        throw err;
      }
    },
    [supabase]
  );

  const refreshUser = useCallback(async () => {
    if (!session?.user) return;

    try {
      const updatedUser = await fetchUserProfile(session.user);
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.message);
    }
  }, [session?.user, fetchUserProfile]);

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        setSession(session);

        if (session?.user) {
          const userData = await fetchUserProfile(session.user);
          if (isMounted) {
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log("Auth state changed:", event);

        setSession(session);
        setError(null);

        if (session?.user) {
          try {
            const userData = await fetchUserProfile(session.user);
            if (isMounted) {
              setUser(userData);
            }
          } catch (err: any) {
            if (isMounted) {
              setError(err.message);
              setUser(null);
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }

        // Only refresh router on sign out or sign in events
        if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
          router.refresh();
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, fetchUserProfile]);

  const contextValue = useMemo(
    () => ({
      session,
      user,
      isLoading,
      error,
      refreshUser,
    }),
    [session, user, isLoading, error, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
