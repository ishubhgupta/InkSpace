import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommentSection from "@/components/blog/CommentSection";
import ShareButtons from "@/components/blog/ShareButtons";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, Eye, User, ArrowLeft } from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, featured_image")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the post with all related data
  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:users(id, username, full_name, avatar_url, bio),
      category:categories(id, name, slug, color),
      post_tags(tag:tags(id, name, slug))
    `
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  // Get comments for this post
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", post.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  // Increment view count
  await supabase
    .from("posts")
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq("id", post.id);
  // Transform content from JSON to HTML if needed
  const content =
    typeof post.content === "string"
      ? post.content
      : typeof post.content === "object"
      ? JSON.stringify(post.content)
      : "";

  // Construct the full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back to blog button */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-video relative">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-8">
            {/* Category */}
            {post.category && (
              <div className="mb-4">
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{
                    backgroundColor: post.category.color + "20",
                    color: post.category.color,
                  }}
                >
                  {post.category.name}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b">
              {post.author && (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={post.author.avatar_url || undefined} />{" "}
                    <AvatarFallback>
                      {post.author.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") ||
                        post.author.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.author.full_name || post.author.username}
                    </p>
                    <p className="text-xs">Author</p>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDistanceToNow(
                  new Date(post.published_at || post.created_at),
                  { addSuffix: true }
                )}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {post.reading_time || 5} min read
              </div>{" "}
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                {post.view_count || 0} views
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex justify-between items-center mb-8 pb-8 border-b">
              <div className="text-sm text-gray-500">Share this post</div>
              <ShareButtons
                title={post.title}
                url={postUrl}
                excerpt={post.excerpt}
              />
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Tags */}
            {post.post_tags && post.post_tags.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.post_tags.map((postTag: any) => (
                    <Badge
                      key={postTag.tag.id}
                      variant="outline"
                      className="text-sm"
                    >
                      #{postTag.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Author bio */}
            {post.author && post.author.bio && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={post.author.avatar_url || undefined} />{" "}
                      <AvatarFallback className="text-lg">
                        {post.author.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") ||
                          post.author.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        About {post.author.full_name || post.author.username}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {post.author.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection postId={post.id} comments={comments || []} />
        </div>

        {/* Related Posts */}
        <div className="mt-16">
          <RelatedPosts postId={post.id} categoryId={post.category?.id} />
        </div>
      </div>
    </div>
  );
}

async function RelatedPosts({
  postId,
  categoryId,
}: {
  postId: string;
  categoryId?: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, featured_image, created_at,
      author:users(full_name, username),
      category:categories(name, color)
    `
    )
    .eq("status", "published")
    .neq("id", postId)
    .limit(3)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: relatedPosts } = await query;

  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((relatedPost) => (
          <Link
            key={relatedPost.id}
            href={`/blog/${relatedPost.slug}`}
            className="group block"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              {relatedPost.featured_image && (
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <Image
                    src={relatedPost.featured_image}
                    alt={relatedPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardContent className="p-6">
                {" "}
                {Array.isArray(relatedPost.category)
                  ? null
                  : relatedPost.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs mb-3"
                        style={{
                          backgroundColor:
                            (relatedPost.category as any).color + "20",
                          color: (relatedPost.category as any).color,
                        }}
                      >
                        {(relatedPost.category as any).name}
                      </Badge>
                    )}
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {relatedPost.title}
                </h3>
                {relatedPost.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {relatedPost.excerpt}
                  </p>
                )}{" "}
                <div className="text-xs text-gray-500">
                  By{" "}
                  {Array.isArray(relatedPost.author)
                    ? "Unknown"
                    : (relatedPost.author as any)?.full_name ||
                      (relatedPost.author as any)?.username}{" "}
                  •{" "}
                  {formatDistanceToNow(new Date(relatedPost.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
