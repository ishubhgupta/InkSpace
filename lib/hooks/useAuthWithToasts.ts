"use client";

import { createClient } from "@/lib/supabase/client";
import { SignInFormData, SignUpFormData } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

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

        // Show success toast
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
          variant: "default",
        });

        // Optimistic redirect for smoother UX
        router.push("/dashboard");

        // Refresh in background after redirect
        setTimeout(() => router.refresh(), 100);

        return { success: true, user: data.user };
      } catch (err: any) {
        const errorMessage = err?.message || "An error occurred during sign in";
        setError(errorMessage);

        // Show error toast
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, error: errorMessage };
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

        // Show success toast
        toast({
          title: "Account created!",
          description: "Welcome to InkSpace! You can now start writing.",
          variant: "default",
        });

        // User profile will be automatically created by the handle_new_user() trigger
        // Optimistic redirect
        router.push("/dashboard");

        // Refresh in background
        setTimeout(() => router.refresh(), 100);

        return { success: true, user: authData.user };
      } catch (err: any) {
        const errorMessage = err?.message || "An error occurred during sign up";
        setError(errorMessage);

        // Show error toast
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, error: errorMessage };
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

      // Show loading toast
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out.",
      });

      // Sign out first
      await supabase.auth.signOut();

      // Show success toast
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        variant: "default",
      });

      // Then navigate
      router.push("/");

      // Refresh to clear any cached data
      setTimeout(() => router.refresh(), 100);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || "An error occurred during sign out";
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Sign out failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
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
