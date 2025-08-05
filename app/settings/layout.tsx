import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/settings-nav";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    .select("role")
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
      id: "data",
      label: "Data",
      roles: ["manager"],
    },
  ];

  const visibleTabs = allTabs.filter(
    (tab) => profile?.role && tab.roles.includes(profile.role)
  );

  return (
    <div className="flex-1 w-full flex flex-col p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your dealership&apos;s app configuration
          </p>
        </div>

        {/* Tab Navigation */}
        <SettingsNav tabs={visibleTabs} />

        {/* Tab Content */}
        <div className="min-h-[500px]">{children}</div>
      </div>
    </div>
  );
}