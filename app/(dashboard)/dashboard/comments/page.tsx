import { requireAuth } from "@/lib/utils/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comments - Dashboard",
  description: "Manage blog post comments.",
};

export default async function CommentsPage() {
  const user = await requireAuth(["author", "admin"]);
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch comments based on user role
  let query = supabase
    .from("comments")
    .select(
      `
      id,
      content,
      status,
      created_at,
      posts:posts!inner (
        id,
        title,
        slug,
        author_id
      ),
      users (
        username,
        full_name,
        avatar_url
      )
    `
    )
    .order("created_at", { ascending: false });

  // If user is not admin, only show comments on their posts
  if (user.role !== "admin") {
    query = query.eq("posts.author_id", user.id);
  }
  type Comment = {
    id: string;
    content: string;
    status: string;
    created_at: string;
    posts:
      | {
          id: string;
          title: string;
          slug: string;
          author_id: string;
        }
      | {
          id: string;
          title: string;
          slug: string;
          author_id: string;
        }[]
      | null;
    users: {
      username?: string;
      full_name?: string;
      avatar_url?: string;
    } | null;
  };

  const { data: comments, error } = await query;

  if (error) {
    console.error("Error fetching comments:", error);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-muted-foreground">
            {user.role === "admin"
              ? "Manage all blog comments"
              : "Manage comments on your posts"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            {" "}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {comments?.filter((c: any) => c.status === "pending").length ||
                  0}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {" "}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {comments?.filter((c: any) => c.status === "approved").length ||
                  0}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {" "}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {comments?.filter((c: any) => c.status === "rejected").length ||
                  0}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-muted-foreground">
              Failed to load comments
            </p>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {" "}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {Array.isArray(comment.users)
                            ? "Anonymous"
                            : (comment.users as any)?.full_name ||
                              (comment.users as any)?.username ||
                              "Anonymous"}
                        </span>
                        <Badge className={getStatusColor(comment.status)}>
                          {comment.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        {comment.content.length > 200
                          ? `${comment.content.substring(0, 200)}...`
                          : comment.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>On:</span>
                        <Link
                          href={`/blog/${
                            Array.isArray(comment.posts)
                              ? comment.posts[0]?.slug ?? ""
                              : comment.posts?.slug ?? ""
                          }`}
                          className="text-primary hover:underline"
                        >
                          {Array.isArray(comment.posts)
                            ? comment.posts[0]?.title ?? ""
                            : comment.posts?.title ?? ""}
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/blog/${
                          Array.isArray(comment.posts)
                            ? comment.posts[0]?.slug ?? ""
                            : comment.posts?.slug ?? ""
                        }`}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      {comment.status !== "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      {comment.status !== "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No comments yet</p>
              <p className="text-sm text-muted-foreground">
                Comments will appear here when readers engage with your posts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
