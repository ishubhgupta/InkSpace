// @ts-nocheck
"use client";

import { createClient } from "@/lib/supabase/client";
import { SignInFormData, SignUpFormData } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async ({ email, password }: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to check role
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Optimistic redirect - don't wait for router.refresh()
      router.push("/dashboard");

      // Refresh in background
      setTimeout(() => router.refresh(), 100);
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };
  const signUp = async ({
    email,
    password,
    username,
    full_name,
  }: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: full_name || "",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed"); // Note: User profile will be automatically created by the handle_new_user() trigger
      // No need to manually insert into users table here

      router.refresh();

      // Wait a bit for the trigger to create the user profile, then check role
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      // Since all users are now authors or admins, redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign out");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    error,
  };
}
