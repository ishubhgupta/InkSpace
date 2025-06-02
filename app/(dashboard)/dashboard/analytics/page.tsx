import { requireAuth } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Eye, FileText, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics - Dashboard',
  description: 'View blog analytics and insights.',
}

export default async function AnalyticsPage() {
  const user = await requireAuth(['author', 'admin'])
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Fetch analytics data based on user role
  let postsQuery = supabase
    .from('posts')
    .select('id, title, views, status, published_at, created_at')
    .order('views', { ascending: false })

  let commentsQuery = supabase
    .from('comments')
    .select(`
      id,
      created_at,
      posts!inner (
        id,
        author_id
      )
    `)

  // If user is not admin, only show their own data
  if (user.role !== 'admin') {
    postsQuery = postsQuery.eq('author_id', user.id)
    commentsQuery = commentsQuery.eq('posts.author_id', user.id)
  }

  const [
    { data: posts, error: postsError },
    { data: comments, error: commentsError }
  ] = await Promise.all([
    postsQuery,
    commentsQuery
  ])

  if (postsError) console.error('Error fetching posts:', postsError)
  if (commentsError) console.error('Error fetching comments:', commentsError)

  // Calculate analytics
  const totalPosts = posts?.length || 0
  const publishedPosts = posts?.filter(p => p.status === 'published').length || 0
  const totalViews = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
  const totalComments = comments?.length || 0

  // Get top performing posts
  const topPosts = posts?.slice(0, 5) || []

  // Calculate growth (last 30 days vs previous 30 days)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const recentPosts = posts?.filter(p => 
    new Date(p.created_at) >= thirtyDaysAgo
  ).length || 0

  const previousPosts = posts?.filter(p => 
    new Date(p.created_at) >= sixtyDaysAgo && 
    new Date(p.created_at) < thirtyDaysAgo
  ).length || 0

  const recentComments = comments?.filter(c => 
    new Date(c.created_at) >= thirtyDaysAgo
  ).length || 0

  const previousComments = comments?.filter(c => 
    new Date(c.created_at) >= sixtyDaysAgo && 
    new Date(c.created_at) < thirtyDaysAgo
  ).length || 0

  const postsGrowth = previousPosts > 0 ? ((recentPosts - previousPosts) / previousPosts) * 100 : 0
  const commentsGrowth = previousComments > 0 ? ((recentComments - previousComments) / previousComments) * 100 : 0

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            {user.role === 'admin' ? 'Blog performance insights' : 'Your content performance'}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPosts} published
            </p>
            {postsGrowth !== 0 && (
              <div className={`flex items-center text-xs ${postsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {postsGrowth > 0 ? '+' : ''}{postsGrowth.toFixed(1)}% from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground">
              Total engagement
            </p>
            {commentsGrowth !== 0 && (
              <div className={`flex items-center text-xs ${commentsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {commentsGrowth > 0 ? '+' : ''}{commentsGrowth.toFixed(1)}% from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per published post
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {topPosts.length > 0 ? (
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Published: {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{post.views || 0}</div>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts available for analysis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Creation (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">New Posts</span>
                <span className="font-medium">{recentPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Published</span>
                <span className="font-medium">
                  {posts?.filter(p => 
                    p.status === 'published' && 
                    new Date(p.created_at) >= thirtyDaysAgo
                  ).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Drafts</span>
                <span className="font-medium">
                  {posts?.filter(p => 
                    p.status === 'draft' && 
                    new Date(p.created_at) >= thirtyDaysAgo
                  ).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">New Comments</span>
                <span className="font-medium">{recentComments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. Comments per Post</span>
                <span className="font-medium">
                  {publishedPosts > 0 ? (totalComments / publishedPosts).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
