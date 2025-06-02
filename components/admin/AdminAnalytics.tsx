"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  MessageSquare,
  Eye,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

interface PlatformStats {
  total_users: number;
  total_posts: number;
  total_comments: number;
  total_views: number;
  admin_users: number;
  author_users: number;
  regular_users: number;
  published_posts: number;
  draft_posts: number;
  recent_signups: number;
  recent_posts: number;
  recent_comments: number;
}

interface RecentActivity {
  type: "user" | "post" | "comment";
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
}

export default function AdminAnalytics() {
  const { user: currentUser } = useAuthContext();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Only allow admin users - check after hooks are declared
  if (currentUser?.role !== "admin") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <p>Access denied. Admin privileges required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch platform analytics using the stored procedure
      const { data: analyticsData, error: analyticsError } = await supabase.rpc(
        "get_platform_analytics"
      );
      if (analyticsError) {
        console.error("Analytics RPC error:", analyticsError);
        // Fallback to manual queries if RPC fails
        const statsQueries = await Promise.all([
          supabase
            .from("users")
            .select("id, role, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("posts")
            .select("id, status, views, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("comments")
            .select("id, created_at")
            .order("created_at", { ascending: false }),
        ]);

        const [usersRes, postsRes, commentsRes] = statsQueries;

        if (!usersRes.error && !postsRes.error && !commentsRes.error) {
          const users = usersRes.data || [];
          const posts = postsRes.data || [];
          const comments = commentsRes.data || [];

          const fallbackStats = {
            total_users: users.length,
            total_posts: posts.length,
            total_comments: comments.length,
            total_views: posts.reduce(
              (sum, post) => sum + (post.views || 0),
              0
            ),
            admin_users: users.filter((u) => u.role === "admin").length,
            author_users: users.filter((u) => u.role === "author").length,
            regular_users: users.filter((u) => u.role === "user").length,
            published_posts: posts.filter((p) => p.status === "published")
              .length,
            draft_posts: posts.filter((p) => p.status === "draft").length,
            recent_signups: users.filter(
              (u) =>
                new Date(u.created_at) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            recent_posts: posts.filter(
              (p) =>
                new Date(p.created_at) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            recent_comments: comments.filter(
              (c) =>
                new Date(c.created_at) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
          };
          setStats(fallbackStats);
        } else {
          throw new Error("Failed to fetch analytics data");
        }
      } else if (analyticsData && analyticsData.length > 0) {
        setStats(analyticsData[0]);
      }

      // Fetch recent activity
      const recentActivities: RecentActivity[] = [];

      // Recent users
      const { data: recentUsers } = await supabase
        .from("users")
        .select("id, full_name, username, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      recentUsers?.forEach((user) => {
        recentActivities.push({
          type: "user",
          id: user.id,
          title: user.full_name || user.username || "New User",
          subtitle: user.email,
          created_at: user.created_at,
        });
      });

      // Recent posts
      const { data: recentPosts } = await supabase
        .from("posts")
        .select(
          "id, title, status, created_at, author:users(username, full_name)"
        )
        .order("created_at", { ascending: false })
        .limit(5);
      recentPosts?.forEach((post) => {
        const author = Array.isArray(post.author)
          ? post.author[0]
          : post.author;
        recentActivities.push({
          type: "post",
          id: post.id,
          title: post.title,
          subtitle: `by ${
            author?.full_name || author?.username || "Unknown"
          } • ${post.status}`,
          created_at: post.created_at,
        });
      });

      // Recent comments
      const { data: recentComments } = await supabase
        .from("comments")
        .select(
          `
          id, content, created_at,
          author:users(username, full_name),
          post:posts(title)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);
      recentComments?.forEach((comment) => {
        const author = Array.isArray(comment.author)
          ? comment.author[0]
          : comment.author;
        const post = Array.isArray(comment.post)
          ? comment.post[0]
          : comment.post;
        recentActivities.push({
          type: "comment",
          id: comment.id,
          title: comment.content.substring(0, 50) + "...",
          subtitle: `by ${
            author?.full_name || author?.username || "Unknown"
          } on "${post?.title || "Unknown post"}"`,
          created_at: comment.created_at,
        });
      });

      // Sort all activities by date
      recentActivities.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentActivity(recentActivities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="w-4 h-4 text-blue-600" />;
      case "post":
        return <FileText className="w-4 h-4 text-green-600" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-orange-600" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Platform Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Platform Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of platform activity and user engagement
          </p>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recent_signups || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.published_posts || 0} published, {stats?.draft_posts || 0}{" "}
              drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comments
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_comments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recent_comments || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_views || 0}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Admins</span>
                </div>
                <span className="font-medium">{stats?.admin_users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Authors</span>
                </div>
                <span className="font-medium">{stats?.author_users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Regular Users</span>
                </div>
                <span className="font-medium">{stats?.regular_users || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 6).map((activity, index) => (
                <div
                  key={`${activity.type}-${activity.id}-${index}`}
                  className="flex items-start gap-3"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {activity.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats?.published_posts || 0}
              </div>
              <p className="text-sm text-muted-foreground">Published Posts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.draft_posts || 0}
              </div>
              <p className="text-sm text-muted-foreground">Draft Posts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.total_posts
                  ? (stats.total_comments / stats.total_posts || 0).toFixed(1)
                  : 0}
              </div>
              <p className="text-sm text-muted-foreground">Avg Comments/Post</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
