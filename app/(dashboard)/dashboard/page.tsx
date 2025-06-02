import { requireAuth } from "@/lib/utils/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Eye, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your blog statistics and recent activity.",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch user's posts
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, title, status, views, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch comments on user's posts
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      status,
      posts!inner (
        id,
        title,
        author_id
      )
    `
    )
    .eq("posts.author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate stats
  const { data: stats, error: statsError } = await supabase
    .from("posts")
    .select("status, views")
    .eq("author_id", user.id);

  const totalPosts = stats?.length || 0;
  const publishedPosts =
    stats?.filter((post) => post.status === "published").length || 0;
  const draftPosts =
    stats?.filter((post) => post.status === "draft").length || 0;
  const totalViews =
    stats?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  return (
    <div className="container mx-auto p-6 space-y-8 mt">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/posts/new">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
            New Post
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPosts} published, {draftPosts} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Across all published posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Recent activity on your posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Reading Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.length > 0
                ? Math.round(
                    stats.reduce(
                      (sum, post) => sum + (post.reading_time || 0),
                      0
                    ) / stats.length
                  )
                : 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                min
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all posts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {postsError ? (
              <p className="text-sm text-muted-foreground">
                Failed to load recent posts
              </p>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="text-sm font-medium hover:underline"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()} ·
                        <span
                          className={
                            post.status === "published"
                              ? "text-green-500"
                              : "text-amber-500"
                          }
                        >
                          {" "}
                          {post.status.charAt(0).toUpperCase() +
                            post.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {post.views || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No posts yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {commentsError ? (
              <p className="text-sm text-muted-foreground">
                Failed to load recent comments
              </p>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <Link
                        href={`/blog/${comment.posts.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        On: {comment.posts.title}
                      </Link>
                      <p className="text-xs mt-1">
                        {comment.content.length > 60
                          ? `${comment.content.substring(0, 60)}...`
                          : comment.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        comment.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : comment.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {comment.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
