import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Explore our latest articles and insights.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Pagination
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const pageSize = 9
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  
  // Get categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')
  
  // Get posts with pagination
  let query = supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      reading_time,
      category_id,
      categories (
        name,
        slug,
        color
      ),
      users!inner (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(start, end)
  
  // Apply category filter if provided
  if (typeof searchParams.category === 'string') {
    query = query.eq('categories.slug', searchParams.category)
  }
  
  const { data: posts, count } = await query
  
  // Calculate total pages
  const totalPages = count ? Math.ceil(count / pageSize) : 0
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore our latest articles, tutorials, and insights on various topics.
        </p>
      </div>
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <Link 
          href="/blog"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !searchParams.category 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All
        </Link>
        {categories?.map(category => (
          <Link 
            key={category.id}
            href={`/blog?category=${category.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              searchParams.category === category.slug 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
      
      {/* Post Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.map(post => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <article className="group overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
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
                {post.categories && (
                  <div className="mb-2">
                    <span 
                      className="inline-block px-2 py-1 rounded-md text-xs font-medium"
                      style={{ 
                        backgroundColor: `${post.categories.color}20`, 
                        color: post.categories.color 
                      }}
                    >
                      {post.categories.name}
                    </span>
                  </div>
                )}
                <h2 className="line-clamp-2 text-xl font-semibold tracking-tight mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="line-clamp-2 text-muted-foreground text-sm mb-4">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-x-4">
                  <div className="flex items-center gap-x-2">
                    <div className="relative h-6 w-6 rounded-full overflow-hidden">
                      {post.users.avatar_url ? (
                        <Image
                          src={post.users.avatar_url}
                          alt={post.users.full_name || post.users.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                          {post.users.full_name?.[0] || post.users.username[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {post.users.full_name || post.users.username}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <time dateTime={post.published_at || ''}>
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Unpublished'
                      }
                    </time>
                    <span> · </span>
                    <span>{post.reading_time} min read</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}

        {(!posts || posts.length === 0) && (
          <div className="col-span-full py-12 text-center">
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {searchParams.category 
                ? `No posts in this category yet. Check back soon or browse other categories.`
                : `No posts available yet. Check back soon!`
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {page > 1 && (
              <Link 
                href={`/blog?page=${page - 1}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                className="px-4 py-2 rounded-md border hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <Link 
                key={pageNum}
                href={`/blog?page=${pageNum}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                className={`px-4 py-2 rounded-md transition-colors ${
                  pageNum === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border hover:bg-muted'
                }`}
              >
                {pageNum}
              </Link>
            ))}
            
            {page < totalPages && (
              <Link 
                href={`/blog?page=${page + 1}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                className="px-4 py-2 rounded-md border hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}