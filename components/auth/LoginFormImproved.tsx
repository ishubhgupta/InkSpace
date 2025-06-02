"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignInFormData } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SignInSchema } from "@/lib/utils/validation";
import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear errors when user starts typing
  const watchedFields = watch();
  useEffect(() => {
    if (error && clearError) {
      clearError();
    }
  }, [watchedFields, error, clearError]);

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn(data);

    if (result?.success) {
      setIsSuccess(true);
      // Show success state briefly before redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-green-600">Welcome back!</h1>
          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 animate-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
            className={
              errors.email
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-xs animate-in slide-in-from-top-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={isLoading}
              className={
                errors.password
                  ? "border-destructive focus-visible:ring-destructive pr-10"
                  : "pr-10"
              }
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs animate-in slide-in-from-top-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full relative" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
