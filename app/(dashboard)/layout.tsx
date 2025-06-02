import Sidebar from "@/components/layout/Sidebar";
import { requireAuth } from "@/lib/utils/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your blog content.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  await requireAuth();
  return (
    <div className="flex min-h-screen">
      <div className="w-64 hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
