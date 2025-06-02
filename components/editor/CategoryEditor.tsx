'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCategories } from '@/lib/hooks/useCategories'
import { CategoryFormData } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { slugify } from '@/lib/utils/slugify'

interface CategoryEditorProps {
  category?: any
}

export default function CategoryEditor({ category }: CategoryEditorProps) {
  const { createCategory, updateCategory, isLoading, error } = useCategories()
  const router = useRouter()
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    color: category?.color || '#3B82F6',
  })

  const [autoSlug, setAutoSlug] = useState(!category?.slug)

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
    if (category?.id) {
      success = await updateCategory(category.id, formData)
    } else {
      success = await createCategory(formData)
    }
    
    if (success) {
      router.push('/dashboard/categories')
    }
  }

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#84CC16', // Lime
    '#6366F1', // Indigo
  ]

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {category ? 'Edit Category' : 'Create New Category'}
        </h1>
        <p className="text-muted-foreground">
          {category ? 'Update category details' : 'Add a new category for organizing posts'}
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter category name..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="category-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly version of the name. Will be auto-generated if left empty.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-20 h-10"
              />
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
                {category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
