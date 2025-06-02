import { requireAuth } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import PostEditor from '@/components/editor/PostEditor'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Edit Post - Dashboard',
  description: 'Edit your blog post.',
}

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await requireAuth(['author', 'admin'])
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Fetch the post to edit
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      featured_image,
      status,
      category_id,
      author_id,
      post_tags (
        tag_id,
        tags (
          id,
          name
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (postError || !post) {
    notFound()
  }

  // Check if user owns this post or is admin
  if (post.author_id !== user.id && user.role !== 'admin') {
    notFound()
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')
  
  // Fetch tags
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name')

  // Transform post data for editor
  const postForEditor = {
    ...post,
    tags: post.post_tags?.map((pt: { tags: { id: string; name: string } | { id: string; name: string }[] }) => {
      // Handle if pt.tags is an array or an object
      if (Array.isArray(pt.tags)) {
        // If it's an array, map each tag object
        return pt.tags.map((tag: { id: string; name: string }) => ({ id: tag.id, name: tag.name }))
      } else if (pt.tags) {
        // If it's a single object
        return { id: pt.tags.id, name: pt.tags.name }
      }
      return null
    }).flat().filter(Boolean) || []
  }

  return (
    <PostEditor 
      post={postForEditor}
      categories={categories || []} 
      tags={tags || []} 
    />
  )
}
