// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useComments } from "@/lib/hooks/useComments";
import { CommentFormData, Comment } from "@/types/blog";
import { Send, MessageCircle, Reply, Clock } from "lucide-react";
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
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClient();

  const [formData, setFormData] = useState<CommentFormData>({
    content: "",
    author_name: "",
    author_email: "",
    author_url: "",
    post_id: postId,
    parent_id: null,
  });

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
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

    if (!formData.content.trim()) {
      alert("Please enter a comment");
      return;
    }

    const commentData = {
      content: formData.content,
      post_id: postId,
      parent_id: parentId || null,
    };

    const success = await createComment(commentData, user.id);

    if (success) {
      setFormData({
        content: "",
        author_name: "",
        author_email: "",
        author_url: "",
        post_id: postId,
        parent_id: null,
      });
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
              <AvatarImage src={comment.author_url || undefined} />
              <AvatarFallback>
                {comment.author_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {comment.author_name}
                </span>
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

              {!isReply && (
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

          {replyingTo === comment.id && (
            <div className="mt-4 ml-11">
              <CommentForm
                onSubmit={(e) => handleSubmit(e, comment.id)}
                formData={formData}
                setFormData={setFormData}
                isLoading={isLoading}
                error={error}
                isReply={true}
                onCancel={() => setReplyingTo(null)}
              />
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
  );

  // Group comments by parent/child relationship
  const organizedComments = comments.filter((comment) => !comment.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </h3>

        {!showCommentForm && (
          <Button
            onClick={() => setShowCommentForm(true)}
            variant="outline"
            size="sm"
          >
            Add Comment
          </Button>
        )}
      </div>

      {showCommentForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentForm
              onSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
              error={error}
              onCancel={() => setShowCommentForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {organizedComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {organizedComments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}

interface CommentFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: CommentFormData;
  setFormData: (data: CommentFormData) => void;
  isLoading: boolean;
  error: string | null;
  isReply?: boolean;
  onCancel?: () => void;
}

function CommentForm({
  onSubmit,
  formData,
  setFormData,
  isLoading,
  error,
  isReply = false,
  onCancel,
}: CommentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {!isReply && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="author_name">Name *</Label>
            <Input
              id="author_name"
              value={formData.author_name}
              onChange={(e) =>
                setFormData({ ...formData, author_name: e.target.value })
              }
              placeholder="Your name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="author_email">Email *</Label>
            <Input
              id="author_email"
              type="email"
              value={formData.author_email}
              onChange={(e) =>
                setFormData({ ...formData, author_email: e.target.value })
              }
              placeholder="your@email.com"
              required
              className="mt-1"
            />
          </div>
        </div>
      )}

      {!isReply && (
        <div>
          <Label htmlFor="author_url">Website (Optional)</Label>
          <Input
            id="author_url"
            type="url"
            value={formData.author_url}
            onChange={(e) =>
              setFormData({ ...formData, author_url: e.target.value })
            }
            placeholder="https://yourwebsite.com"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="content">Comment *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder={
            isReply ? "Write your reply..." : "Share your thoughts..."
          }
          required
          rows={isReply ? 3 : 4}
          className="mt-1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.content.trim() ||
            !formData.author_name.trim() ||
            !formData.author_email.trim()
          }
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
              {isReply ? "Post Reply" : "Post Comment"}
            </>
          )}
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
