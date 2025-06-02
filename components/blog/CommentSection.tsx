"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useComments } from "@/lib/hooks/useComments";
import { Comment } from "@/types/blog";
import { Send, MessageCircle, Reply, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
}

export default function CommentSection({
  postId,
  comments = [],
}: CommentSectionProps) {
  const { createComment, isLoading, error } = useComments();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentsPerPage] = useState(5); // Show 5 comments initially
  const supabase = createClient();

  // Check authentication status and get user profile
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single();
        setUserProfile(profile);
      }

      setAuthLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", session.user.id)
          .single();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to comment");
      return;
    }

    if (!commentContent.trim()) {
      alert("Please enter a comment");
      return;
    }

    const commentData = {
      content: commentContent,
      post_id: postId,
      parent_id: parentId || null,
    };

    const success = await createComment(commentData, user.id);
    if (success) {
      setCommentContent("");
      setShowCommentForm(false);
      setReplyingTo(null);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-4" : "mb-6"}`}>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">User</span>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </Badge>
                {comment.status === "pending" && (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
              </div>

              <div className="text-sm text-gray-700 leading-relaxed">
                {comment.content}
              </div>

              {!isReply && user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className="text-xs h-7"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>

          {replyingTo === comment.id && user && (
            <div className="mt-4 ml-11">
              <form
                onSubmit={(e) => handleSubmit(e, comment.id)}
                className="space-y-3"
              >
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center space-x-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !commentContent.trim()}
                    size="sm"
                  >
                    {isLoading ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  ); // Group comments by parent/child relationship
  const organizedComments = comments
    .filter((comment) => !comment.parent_id)
    .map((comment) => ({
      ...comment,
      replies: comments.filter((reply) => reply.parent_id === comment.id),
    }));

  // Determine how many comments to show
  const commentsToShow = showAllComments
    ? organizedComments
    : organizedComments.slice(0, commentsPerPage);

  const hasMoreComments = organizedComments.length > commentsPerPage;

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </h3>

        {user ? (
          <Button
            variant={showCommentForm ? "outline" : "default"}
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="text-sm"
          >
            <Send className="h-4 w-4 mr-2" />
            {showCommentForm ? "Cancel" : "Add Comment"}
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="text-sm">
              <Send className="h-4 w-4 mr-2" />
              Login to Comment
            </Button>
          </Link>
        )}
      </div>
      {showCommentForm && user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              Add a Comment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="resize-none"
                required
              />

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !commentContent.trim()}
                  size="sm"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Posting...
                    </span>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}{" "}
      {organizedComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No comments yet. Be the first to share your thoughts!</p>
          {!user && (
            <p className="mt-2">
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>{" "}
              to leave a comment.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6">
            {commentsToShow.map((comment) => renderComment(comment))}
          </div>

          {/* Show More/Show Less Button */}
          {hasMoreComments && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAllComments(!showAllComments)}
                className="text-sm"
              >
                {showAllComments ? (
                  <>Show Less Comments</>
                ) : (
                  <>
                    Show More Comments (
                    {organizedComments.length - commentsPerPage} more)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
