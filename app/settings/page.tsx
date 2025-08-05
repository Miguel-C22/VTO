import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dealership_id")
    .eq("id", user.id)
    .single();

  // Define available tabs based on role
  const allTabs = [
    {
      id: "account",
      label: "Account",
      roles: ["manager", "associate"],
    },
    {
      id: "general",
      label: "General",
      roles: ["manager"],
    },
    {
      id: "users",
      label: "Users",
      roles: ["manager"],
    },
    {
      id: "objections",
      label: "Objections",
      roles: ["manager"],
    },
    {
      id: "notifications",
      label: "Notifications",
      roles: ["manager"],
    },
    {
      id: "security",
      label: "Security",
      roles: ["manager"],
    },
  ];

  const visibleTabs = allTabs.filter(
    (tab) => profile?.role && tab.roles.includes(profile.role)
  );

  // Redirect to the first available tab for the user's role
  const firstAvailableTab = visibleTabs[0];
  if (firstAvailableTab) {
    redirect(`/settings/${firstAvailableTab.id}`);
  } else {
    // Fallback if no tabs are available (shouldn't happen)
    redirect("/settings/account");
  }

}
