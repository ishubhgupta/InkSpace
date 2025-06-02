"use client";

import { createClient } from "@/lib/supabase/client";
import { SignInFormData, SignUpFormData } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async ({ email, password }: SignInFormData) => {
      try {
        setIsLoading(true);
        setError(null);

        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Optimistic redirect for smoother UX
        router.push("/dashboard");

        // Refresh in background after redirect
        setTimeout(() => router.refresh(), 100);

        return { success: true, user: data.user };
      } catch (err: any) {
        setError(err?.message || "An error occurred during sign in");
        return { success: false, error: err?.message };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router]
  );

  const signUp = useCallback(
    async ({ email, password, username, full_name }: SignUpFormData) => {
      try {
        setIsLoading(true);
        setError(null);

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              data: {
                username,
                full_name: full_name || "",
              },
            },
          }
        );

        if (authError) throw authError;
        if (!authData.user) throw new Error("User creation failed");

        // User profile will be automatically created by the handle_new_user() trigger
        // Optimistic redirect
        router.push("/dashboard");

        // Refresh in background
        setTimeout(() => router.refresh(), 100);

        return { success: true, user: authData.user };
      } catch (err: any) {
        setError(err?.message || "An error occurred during sign up");
        return { success: false, error: err?.message };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router]
  );

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistic navigation first for immediate feedback
      router.push("/");

      // Sign out in background
      await supabase.auth.signOut();

      // Refresh to clear any cached data
      setTimeout(() => router.refresh(), 100);

      return { success: true };
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign out");
      return { success: false, error: err?.message };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    clearError,
    isLoading,
    error,
  };
}
