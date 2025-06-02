import { requireAuth } from '@/lib/utils/auth'
import CategoryEditor from '@/components/editor/CategoryEditor'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Category - Dashboard',
  description: 'Create a new blog category.',
}

export default async function NewCategoryPage() {
  await requireAuth(['admin'])

  return <CategoryEditor />
}
