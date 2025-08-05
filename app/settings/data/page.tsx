import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ResetConfigurationManager } from "@/components/reset-configuration-manager";

export default async function DataSettingsPage() {
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

  // Only managers can access data settings
  if (profile?.role !== "manager") {
    return redirect("/settings/account");
  }

  if (!profile.dealership_id) {
    return redirect("/settings/account");
  }

  // Get current reset configuration
  const { data: resetConfig, error } = await supabase
    .from("reset_configurations")
    .select("*")
    .eq("dealership_id", profile.dealership_id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
    console.error("Error fetching reset configuration:", error);
  }

  // Default configuration if none exists
  const defaultConfig = {
    reset_type: 'monthly',
    reset_time: '12:00:00',
    last_reset: '2024-01-01', // Default to start of year since it's NOT NULL
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const currentConfig = resetConfig || defaultConfig;

  return (
    <ResetConfigurationManager 
      initialConfig={currentConfig}
      dealershipId={profile.dealership_id}
    />
  );
}