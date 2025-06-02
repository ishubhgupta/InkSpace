"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from "./RichTextEditor";
import { usePosts } from "@/lib/hooks/usePosts";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { PostFormData, PostStatus } from "@/types/blog";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, Save, Eye } from "lucide-react";
import Image from "next/image";

interface PostEditorProps {
  post?: any;
  categories?: any[];
  tags?: any[];
}

export default function PostEditor({
  post,
  categories = [],
  tags = [],
}: PostEditorProps) {
  const { user } = useAuthContext();
  const {
    createPost,
    updatePost,
    isLoading: isSaving,
    error: postsError,
  } = usePosts();
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine errors from usePosts hook and local validation
  const error = localError || postsError;
  // Helper function to convert content between formats
  const getContentAsHtml = (content: any): string => {
    if (typeof content === "string") {
      // If it looks like HTML, return as is
      if (content.includes("<") && content.includes(">")) {
        return content;
      }
      // Otherwise, wrap in paragraph tags
      return content ? `<p>${content}</p>` : "";
    }
    if (content && typeof content === "object") {
      // If it's JSON content, convert to basic HTML (simplified)
      return "";
    }
    return "";
  };

  const [formData, setFormData] = useState<PostFormData>({
    title: post?.title || "",
    content: post?.content || { type: "doc", content: [] },
    excerpt: post?.excerpt || "",
    featured_image: post?.featured_image || "",
    category_id: post?.category_id || "",
    tags: post?.tags?.map((t: any) => t.id) || [],
    status: post?.status || "draft",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t: any) => t.id) || []
  );

  // State to track HTML content for the editor
  const [htmlContent, setHtmlContent] = useState<string>(
    getContentAsHtml(post?.content)
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadFile(file);
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, featured_image: imageUrl }));
    }
  };
  const handleSubmit = async (status: PostStatus) => {
    setLocalError(null); // Clear any previous errors

    if (!user) {
      setLocalError("You must be logged in to create posts");
      return;
    }

    if (!formData.title.trim()) {
      setLocalError("Please enter a title for your post");
      return;
    }

    if (status === "published" && !hasContent(htmlContent)) {
      setLocalError("Please add some content before publishing");
      return;
    }

    // Convert HTML content to simple JSON structure for storage
    const contentForStorage = htmlContent ? htmlContent : "<p></p>";

    const submitData = {
      ...formData,
      content: contentForStorage, // Store as HTML string for now
      status,
      tags: selectedTags,
    };

    let success = false;
    if (post?.id) {
      success = await updatePost(post.id, submitData);
    } else {
      success = await createPost(submitData, user.id);
    }

    if (success) {
      router.push("/dashboard/posts");
    }
  };
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Helper function to check if content has meaningful text
  const hasContent = (content: string): boolean => {
    if (!content || !content.trim()) return false;

    // Remove HTML tags and check if there's actual text content
    const textContent = content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .trim();

    return textContent.length > 0;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {post ? "Edit Post" : "Create New Post"}
        </h1>{" "}
        <div className="flex gap-2">
          {" "}
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={isSaving || !formData.title.trim()}
            className="transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>{" "}
          <Button
            onClick={() => handleSubmit("published")}
            disabled={
              isSaving || !formData.title.trim() || !hasContent(htmlContent)
            }
            className="transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter post title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your post..."
                  className="mt-1"
                  rows={3}
                />
              </div>{" "}
              <div>
                <Label htmlFor="content">Content</Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={htmlContent}
                    onChange={(content) => {
                      setHtmlContent(content);
                      setFormData((prev) => ({ ...prev, content }));
                    }}
                    placeholder="Write your post content here..."
                    className="min-h-[400px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.featured_image ? (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={formData.featured_image}
                      alt="Featured image"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, featured_image: "" }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload featured image
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                  {isUploading && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.id) ? "default" : "outline"
                    }
                    className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tags available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
