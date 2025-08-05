import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ManagerDashboard } from "@/components/manager-dashboard";
import { getUsersWithMetadata } from "@/lib/user-utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dealership_id")
    .eq("id", user.id)
    .single();

  // Only managers can access dashboard
  if (profile?.role !== "manager") {
    return redirect("/sales-assist-form");
  }

  if (!profile.dealership_id) {
    return redirect("/sales-assist-form");
  }

  // Get dealership information
  const { data: dealership } = await supabase
    .from("dealerships")
    .select("name, city, state")
    .eq("id", profile.dealership_id)
    .single();

  // Fetch dashboard data in parallel
  const [
    submissionsResult,
    choicesResult,
    teamResult,
    trainingResult,
    resetConfigResult
  ] = await Promise.all([
    // Recent submissions (last 30 days)
    supabase
      .from("submissions")
      .select("id, associate_id, choices, comment, created_at, resolved, notified_manager_ids")
      .eq("dealership_id", profile.dealership_id)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false }),

    // Active objection choices
    supabase
      .from("choices")
      .select("id, description")
      .eq("dealership_id", profile.dealership_id)
      .eq("is_active", true),

    // Team members
    supabase
      .from("profiles")
      .select("id, role, created_at")
      .eq("dealership_id", profile.dealership_id),

    // Training programs overview
    supabase
      .from("training_programs")
      .select("id, associate_id, completed, priority, created_at")
      .eq("dealership_id", profile.dealership_id),

    // Reset configuration
    supabase
      .from("reset_configurations")
      .select("reset_type, reset_time, last_reset")
      .eq("dealership_id", profile.dealership_id)
      .single()
  ]);

  // Get user metadata for team members
  const teamUserIds = teamResult.data?.map(t => t.id) || [];
  const teamWithMetadata = teamUserIds.length > 0 
    ? await getUsersWithMetadata(teamUserIds)
    : [];

  // Get current active alerts (unresolved submissions where this manager was notified)
  const { data: activeAlerts } = await supabase
    .from("submissions")
    .select("id, associate_id, created_at")
    .eq("dealership_id", profile.dealership_id)
    .eq("resolved", false)
    .contains("notified_manager_ids", [user.id]);

  return (
    <ManagerDashboard
      dealership={dealership}
      submissions={submissionsResult.data || []}
      choices={choicesResult.data || []}
      team={teamResult.data || []}
      teamWithMetadata={teamWithMetadata}
      trainingPrograms={trainingResult.data || []}
      resetConfig={resetConfigResult.data}
      activeAlerts={activeAlerts || []}
      currentManagerId={user.id}
    />
  );
}