import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AlertsView } from "@/components/alerts-view";
import { getUsersWithMetadata } from "@/lib/user-utils";

export default async function AlertsPage() {
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

  // Only managers can access alerts
  if (profile?.role !== "manager") {
    return redirect("/sales-assist-form");
  }

  if (!profile.dealership_id) {
    return redirect("/sales-assist-form");
  }

  // Get submissions where this manager was notified and alert is not resolved
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, associate_id, choices, comment, notified_manager_ids, created_at, resolved")
    .eq("dealership_id", profile.dealership_id)
    .eq("resolved", false)
    .contains("notified_manager_ids", [user.id])
    .order("created_at", { ascending: false });

  // Get choices for objection descriptions
  const { data: choices } = await supabase
    .from("choices")
    .select("id, description")
    .eq("dealership_id", profile.dealership_id)
    .eq("is_active", true);

  // Get all user IDs from submissions to fetch metadata
  const allUserIds = Array.from(
    new Set(submissions?.map(s => s.associate_id) || [])
  );

  // Get user metadata for associates
  const usersWithMetadata = allUserIds.length > 0 
    ? await getUsersWithMetadata(allUserIds)
    : [];

  return (
    <AlertsView
      submissions={submissions || []}
      choices={choices || []}
      usersWithMetadata={usersWithMetadata}
      currentManagerId={user.id}
    />
  );
}