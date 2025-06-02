import { requireAuth } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import PostEditor from '@/components/editor/PostEditor'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Post - Dashboard',
  description: 'Create a new blog post.',
}

export default async function NewPostPage() {
  const user = await requireAuth(['author', 'admin'])
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
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

  return (
    <PostEditor 
      categories={categories || []} 
      tags={tags || []} 
    />
  )
}
