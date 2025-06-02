import { Metadata } from "next";
import UserManagement from "@/components/admin/UserManagement";

export const metadata: Metadata = {
  title: "User Management - InkSpace Admin",
  description: "Manage user roles and permissions",
};

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions across the platform
        </p>
      </div>

      <UserManagement />
    </div>
  );
}
