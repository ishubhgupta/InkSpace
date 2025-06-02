"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Mail,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  excerpt?: string;
  className?: string;
}

export default function ShareButtons({
  title,
  url,
  excerpt,
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedExcerpt = encodeURIComponent(excerpt || title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedExcerpt}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    // Track share analytics here if needed
    console.log(`Shared on ${platform}:`, { title, url });
  };

  const openShareWindow = (url: string, platform: string) => {
    handleShare(platform);
    window.open(
      url,
      "share-window",
      "width=600,height=400,scrollbars=yes,resizable=yes"
    );
  };

  // Check if Web Share API is available
  const canWebShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleWebShare = async () => {
    if (canWebShare) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url,
        });
        handleShare("web-share-api");
      } catch (err) {
        // User cancelled sharing or error occurred
        console.log("Web share cancelled or failed:", err);
      }
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Native Web Share API (mobile/supported browsers) */}
          {canWebShare && (
            <>
              <DropdownMenuItem onClick={handleWebShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Social Media Platforms */}
          <DropdownMenuItem
            onClick={() => openShareWindow(shareLinks.twitter, "twitter")}
            className="gap-2"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => openShareWindow(shareLinks.facebook, "facebook")}
            className="gap-2"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => openShareWindow(shareLinks.linkedin, "linkedin")}
            className="gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => openShareWindow(shareLinks.email, "email")}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Copy Link */}
          <DropdownMenuItem onClick={copyToClipboard} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
