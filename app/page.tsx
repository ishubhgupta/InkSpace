import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "InkSpace - Modern Blog Platform",
  description:
    "A modern blog platform built with Next.js, TypeScript, and Supabase.",
};

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: featuredPosts } = await supabase
    .from("posts")
    .select(
      `
      id, 
      title, 
      slug, 
      excerpt, 
      featured_image, 
      published_at,
      users!inner (
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                The Modern Blog Platform
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Share your ideas with the world
              </h1>{" "}
              <p className="text-muted-foreground md:text-xl">
                InkSpace is a powerful, flexible, and easy-to-use blog platform
                built with modern technologies. Create and share your content
                with just a few clicks.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/blog">
                  <Button className="px-6">
                    Explore Blog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="px-6">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                alt="People collaborating on content"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Featured Content
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Latest from the Blog
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Discover our most recent articles and insights.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:gap-8 mt-8 md:mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-video relative overflow-hidden">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden">
                        {post.users[0]?.avatar_url ? (
                          <Image
                            src={post.users[0].avatar_url}
                            alt={
                              post.users[0]?.full_name ||
                              post.users[0]?.username
                            }
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                            {post.users[0]?.full_name?.[0] ||
                              post.users[0]?.username?.[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {post.users[0]?.full_name || post.users[0]?.username}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.published_at!).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-primary">
                      <span className="text-sm font-medium">Read more</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {(!featuredPosts || featuredPosts.length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No posts available yet. Check back soon!
                </p>
                <Link href="/register" className="mt-4 inline-block">
                  <Button variant="outline">Create your first post</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Powerful Features
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Everything you need to create and manage your blog.
              </p>
            </div>
          </div>
          <div className="grid gap-6 mt-8 md:mt-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                  <path d="M10 2c1 .5 2 2 2 5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Rich Editor</h3>
              <p className="text-center text-muted-foreground">
                Powerful WYSIWYG editor with support for rich content including
                images, links, and markdown shortcuts.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m2 12 5-3-1.5 3L7 15Z" />
                  <path d="M22 12h-5" />
                  <path d="M14 7v10" />
                  <path d="M8 7v10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Analytics</h3>
              <p className="text-center text-muted-foreground">
                Track post views, reading time, and engagement to understand
                what your audience loves.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure</h3>
              <p className="text-center text-muted-foreground">
                Built-in authentication and role-based access control keep your
                content safe.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 10h8" />
                  <path d="M8 14h8" />
                  <path d="M8 18h5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">SEO Ready</h3>
              <p className="text-center text-muted-foreground">
                Optimized for search engines with dynamic meta tags and
                structured data.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
                  <line x1="2" x2="22" y1="20" y2="20" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Responsive Design</h3>
              <p className="text-center text-muted-foreground">
                Beautiful and responsive design that looks great on all devices
                from mobile to desktop.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M17 14V2" />
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Comments</h3>
              <p className="text-center text-muted-foreground">
                Interactive comment system with moderation tools and nested
                replies for better engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to start blogging?
              </h2>
              <p className="md:text-xl">
                Create your account today and join thousands of content creators
                sharing their knowledge and stories.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/register">
                  <Button variant="secondary" className="px-6">
                    Get Started
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button
                    variant="outline"
                    className="border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10 text-primary-foreground px-6"
                  >
                    Read Blog
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:pl-10">
              <ul className="grid gap-4">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Easy to Use</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Intuitive dashboard and editor makes content creation
                      simple.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Fast Performance</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Built on Next.js for optimal speed and user experience.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Free to Start</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Begin your blogging journey at no cost.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
