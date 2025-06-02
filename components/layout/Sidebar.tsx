"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileEdit,
  Home,
  PieChart,
  Settings,
  Tag,
  Layers,
  MessageSquare,
} from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const isAdmin = user?.role === "admin";
  const isAuthor = user?.role === "author" || user?.role === "admin";

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      name: "Posts",
      href: "/dashboard/posts",
      icon: FileEdit,
      active: pathname.startsWith("/dashboard/posts"),
      show: isAuthor,
    },
    {
      name: "Categories",
      href: "/dashboard/categories",
      icon: Layers,
      active: pathname.startsWith("/dashboard/categories"),
      show: isAdmin,
    },
    {
      name: "Tags",
      href: "/dashboard/tags",
      icon: Tag,
      active: pathname.startsWith("/dashboard/tags"),
      show: isAdmin,
    },
    {
      name: "Comments",
      href: "/dashboard/comments",
      icon: MessageSquare,
      active: pathname.startsWith("/dashboard/comments"),
      show: isAdmin || isAuthor,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: PieChart,
      active: pathname.startsWith("/dashboard/analytics"),
      show: isAdmin || isAuthor,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];
  return (
    <div className="flex h-screen flex-col border-r bg-muted/10">
      {/* <div className="flex h-14 items-center border-b px-4 mt">
        {" "}
        <Link
          href="/"
          className="flex items-center space-x-2 text-primary font-semibold"
        >
          <BookOpen className="h-5 w-5" />
          <span>InkSpace</span>
        </Link>
      </div> */}

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {" "}
          {navigation.map(
            (item) =>
              item.show !== false && (
                <Button
                  key={item.name}
                  variant={item.active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]",
                    item.active && "font-medium"
                  )}
                  asChild
                >
                  <Link href={item.href} prefetch={true}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
          )}
        </div>
      </ScrollArea>

      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {getInitials(user.full_name || user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {user.full_name || user.username}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
