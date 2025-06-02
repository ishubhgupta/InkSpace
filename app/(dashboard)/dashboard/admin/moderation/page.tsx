import { Metadata } from "next";
import ContentModeration from "@/components/admin/ContentModeration";

export const metadata: Metadata = {
  title: "Content Moderation - InkSpace Admin",
  description: "Moderate posts and comments on the platform",
};

export default function ContentModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Content Moderation
        </h1>
        <p className="text-muted-foreground">
          Review and moderate all posts and comments on the platform
        </p>
      </div>

      <ContentModeration />
    </div>
  );
}
