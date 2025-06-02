"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LogOut, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthContext } from "@/components/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { signOut, isLoading } = useAuth();
  const { user, isLoading: authLoading } = useAuthContext();

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { signOut, isLoading } = useAuth();
  const { user, isLoading: authLoading } = useAuthContext();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle scroll event for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Force a page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error("Sign out error:", error);
      // Still redirect even if there's an error to prevent stuck state
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-sm py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {" "}
        <Link
          href="/"
          className="flex items-center space-x-2 text-primary font-bold text-xl"
        >
          <BookOpen className="h-6 w-6" />
          <span>InkSpace</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/" pathname={pathname}>
            Home
          </NavLink>
          <NavLink href="/blog" pathname={pathname}>
            Blog
          </NavLink>
          {user ? (
            <>
              <NavLink href="/dashboard" pathname={pathname}>
                Dashboard
              </NavLink>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={isSigningOut || isLoading}
                className="text-sm font-medium transition-all duration-200 hover:bg-muted"
              >
                {isSigningOut ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">                <Button
                  variant="ghost"
                  size="sm"
                  className="transition-all duration-150 hover:bg-muted"
                >
                  Login
                </Button>
              </Link>              <Link href="/register">
                <Button
                  variant="default"
                  size="sm"
                  className="transition-all duration-150 hover:scale-105"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <MobileNavLink href="/" pathname={pathname} onClick={closeMenu}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/blog" pathname={pathname} onClick={closeMenu}>
              Blog
            </MobileNavLink>
            {user ? (
              <>
                <MobileNavLink
                  href="/dashboard"
                  pathname={pathname}
                  onClick={closeMenu}
                >
                  Dashboard
                </MobileNavLink>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  disabled={isSigningOut || isLoading}
                  className="justify-start px-0 text-sm font-medium transition-all duration-200"
                >
                  {isSigningOut ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing out...
                    </>
                  ) : (
                    "Sign Out"
                  )}
                </Button>
              </>
            ) : (
              <>
                <MobileNavLink
                  href="/login"
                  pathname={pathname}
                  onClick={closeMenu}
                >
                  Login
                </MobileNavLink>
                <MobileNavLink
                  href="/register"
                  pathname={pathname}
                  onClick={closeMenu}
                >
                  Register
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

type NavLinkProps = {
  href: string;
  pathname: string;
  children: React.ReactNode;
};

function NavLink({ href, pathname, children }: NavLinkProps) {
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "text-sm font-medium transition-colors duration-150 hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

type MobileNavLinkProps = NavLinkProps & {
  onClick: () => void;
};

function MobileNavLink({
  href,
  pathname,
  onClick,
  children,
}: MobileNavLinkProps) {
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onClick}
      className={cn(
        "text-base font-medium transition-colors duration-150",
        isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
      )}
    >
      {children}
    </Link>
  );
}
