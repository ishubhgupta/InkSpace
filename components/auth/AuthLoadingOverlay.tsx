"use client";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLoadingOverlay() {
  const { isLoading } = useAuthContext();
  const [showOverlay, setShowOverlay] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      // Add a small delay before showing the overlay to prevent flashes
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Hide overlay immediately when loading is done
      setShowOverlay(false);
    }
  }, [isLoading]);

  // Don't show overlay on auth pages or if loading is very brief
  if (pathname.includes("/login") || pathname.includes("/register")) {
    return null;
  }

  // Only show if explicitly loading and we've waited a bit
  if (!showOverlay || !isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
