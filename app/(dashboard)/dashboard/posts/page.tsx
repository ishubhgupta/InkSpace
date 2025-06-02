import { requireAuth } from "@/lib/utils/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import DeletePostButton from "@/components/dashboard/DeletePostButton";

export const metadata: Metadata = {
  title: "Posts - Dashboard",
  description: "Manage your blog posts.",
};

export default async function PostsPage() {
  const user = await requireAuth(["author", "admin"]);
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch user's posts
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      status,
      views,
      created_at,
      published_at,
      categories (
        name,
        color
      )
    `
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-muted-foreground">
              Failed to load posts
            </p>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      {post.categories && (
                        <Badge
                          variant="outline"
                          style={{ borderColor: post.categories.color }}
                        >
                          {post.categories.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      {post.published_at && (
                        <span>
                          Published:{" "}
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === "published" && (
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}{" "}
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeletePostButton postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Link href="/dashboard/posts/new">
                <Button>Create your first post</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
