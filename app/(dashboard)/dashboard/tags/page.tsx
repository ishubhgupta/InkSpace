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
  title: 'Tags - Dashboard',
  description: 'Manage blog post tags.',
}

export default async function TagsPage() {
  const user = await requireAuth(['admin'])
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Fetch tags with post counts
  const { data: tags, error } = await supabase
    .from('tags')
    .select(`
      id,
      name,
      slug,
      created_at,
      post_tags (count)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">Manage blog post tags</p>
        </div>
        <Link href="/dashboard/tags/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Tag
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-muted-foreground">Failed to load tags</p>
          ) : tags && tags.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tags.map((tag) => (
                <div key={tag.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tag.name}</h3>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/tags/${tag.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        disabled={(tag.post_tags?.[0]?.count || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Slug: /{tag.slug}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {tag.post_tags?.[0]?.count || 0} posts
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tag.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tags yet</p>
              <Link href="/dashboard/tags/new">
                <Button>Create your first tag</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
