import RegisterForm from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new NextBlog account.',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <RegisterForm />
      </div>
    </div>
  )
}