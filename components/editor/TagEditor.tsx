'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTags } from '@/lib/hooks/useTags'
import { TagFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { slugify } from '@/lib/utils/slugify'

interface TagEditorProps {
  tag?: any
}

export default function TagEditor({ tag }: TagEditorProps) {
  const { createTag, updateTag, isLoading, error } = useTags()
  const router = useRouter()
  
  const [formData, setFormData] = useState<TagFormData>({
    name: tag?.name || '',
    slug: tag?.slug || '',
  })

  const [autoSlug, setAutoSlug] = useState(!tag?.slug)

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: autoSlug ? slugify(name) : prev.slug
    }))
  }

  const handleSlugChange = (slug: string) => {
    setAutoSlug(false)
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let success = false
    if (tag?.id) {
      success = await updateTag(tag.id, formData)
    } else {
      success = await createTag(formData)
    }
    
    if (success) {
      router.push('/dashboard/tags')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {tag ? 'Edit Tag' : 'Create New Tag'}
        </h1>
        <p className="text-muted-foreground">
          {tag ? 'Update tag details' : 'Add a new tag for organizing posts'}
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tag Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter tag name..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="tag-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly version of the name. Will be auto-generated if left empty.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.slug.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {tag ? 'Update Tag' : 'Create Tag'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
