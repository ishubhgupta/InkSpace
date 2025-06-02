"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Edit } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { UserRole } from "@/types/blog";
import { toast } from "@/hooks/use-toast";

interface RoleSwitcherProps {
  className?: string;
}

export default function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { user } = useAuthContext();
  const [currentMode, setCurrentMode] = useState<UserRole>(
    user?.role || "author"
  );

  // Only show role switcher for admin users
  if (user?.role !== "admin") {
    return (
      <Badge variant="secondary" className={className}>
        <User className="w-3 h-3 mr-1" />
        {user?.role || "User"}
      </Badge>
    );
  }

  const handleRoleSwitch = (newRole: UserRole) => {
    setCurrentMode(newRole);
    toast({
      title: "Mode switched",
      description: `Now operating in ${newRole} mode`,
    });
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "author":
        return <Edit className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "author":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground">Mode:</span>
      <Select value={currentMode} onValueChange={handleRoleSwitch}>
        <SelectTrigger className="w-auto h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </div>
          </SelectItem>
          <SelectItem value="author">
            <div className="flex items-center gap-2">
              <Edit className="w-3 h-3" />
              <span>Author</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <Badge variant={getRoleColor(currentMode) as any} className="text-xs">
        {getRoleIcon(currentMode)}
        <span className="ml-1 capitalize">{currentMode}</span>
      </Badge>
    </div>
  );
}
