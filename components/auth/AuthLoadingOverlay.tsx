"use client";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLoadingOverlay() {
  const { isLoading, user } = useAuthContext();
  const [showOverlay, setShowOverlay] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      setShowOverlay(true);
    } else {
      // Delay hiding overlay slightly for smoother transition
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Don't show overlay on auth pages
  if (pathname.includes("/login") || pathname.includes("/register")) {
    return null;
  }

  if (!showOverlay) {
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
