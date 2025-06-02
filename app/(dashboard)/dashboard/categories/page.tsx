import { requireAuth } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categories - Dashboard',
  description: 'Manage blog post categories.',
}

export default async function CategoriesPage() {
  const user = await requireAuth(['admin'])
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Fetch categories with post counts
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      description,
      color,
      created_at,
      posts (count)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage blog post categories</p>
        </div>
        <Link href="/dashboard/categories/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-muted-foreground">Failed to load categories</p>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge variant="secondary">
                        {category.posts?.[0]?.count || 0} posts
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Slug: /{category.slug}</span>
                      <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/categories/${category.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      disabled={(category.posts?.[0]?.count || 0) > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No categories yet</p>
              <Link href="/dashboard/categories/new">
                <Button>Create your first category</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
