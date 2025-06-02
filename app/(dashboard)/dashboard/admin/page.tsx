import { Metadata } from "next";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

export const metadata: Metadata = {
  title: "Admin Dashboard - InkSpace",
  description: "Administrative dashboard for platform management",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and administrative controls
        </p>
      </div>

      <AdminAnalytics />
    </div>
  );
}
