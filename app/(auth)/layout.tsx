export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pt-20">{children}</div>
  )
}