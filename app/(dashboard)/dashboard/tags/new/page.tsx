import { requireAuth } from '@/lib/utils/auth'
import TagEditor from '@/components/editor/TagEditor'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Tag - Dashboard',
  description: 'Create a new blog tag.',
}

export default async function NewTagPage() {
  await requireAuth(['admin'])

  return <TagEditor />
}
