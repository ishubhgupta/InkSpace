import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-primary font-bold text-xl mb-4"
            >
              <BookOpen className="h-6 w-6" />
              <span>NextBlog</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              A modern blog platform built with Next.js, TypeScript, and Supabase.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-medium text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-medium text-sm mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/category/technology" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/blog/category/design" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/blog/category/business" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/blog/category/lifestyle" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lifestyle
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-medium text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {currentYear} InkSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}