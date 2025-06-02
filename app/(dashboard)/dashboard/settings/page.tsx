import { requireAuth } from "@/lib/utils/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
// Update the import path below if the actual location is different, e.g. "@/components/SettingsEditor" or a relative path like "../../components/editor/SettingsEditor"
import SettingsEditor from "../../../../components/editor/SettingsEditor";

export const metadata: Metadata = {
  title: "Settings - Dashboard",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const user = await requireAuth();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch user profile data
  const { data: userProfile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <SettingsEditor user={userProfile || user} />
    </div>
  );
}
