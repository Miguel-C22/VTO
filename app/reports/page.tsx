import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ReportsAnalytics } from "@/components/reports-analytics";
import { getUsersWithMetadata } from "@/lib/user-utils";

export default async function ReportsPage() {
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

  // Only managers can access reports
  if (profile?.role !== "manager") {
    return redirect("/settings/account");
  }

  if (!profile.dealership_id) {
    return redirect("/settings/account");
  }

  // Fetch analytics data
  const [submissionsResult, choicesResult, usersResult] = await Promise.all([
    // Get all submissions for this dealership
    supabase
      .from("submissions")
      .select(`
        id,
        choices,
        comment,
        created_at,
        associate_id,
        notified_manager_ids,
        resolved
      `)
      .eq("dealership_id", profile.dealership_id)
      .order("created_at", { ascending: false }),

    // Get all objection choices for this dealership
    supabase
      .from("choices")
      .select("id, description")
      .eq("dealership_id", profile.dealership_id)
      .eq("is_active", true),

    // Get all users for this dealership
    supabase
      .from("profiles")
      .select("id, role")
      .eq("dealership_id", profile.dealership_id)
  ]);

  const submissions = submissionsResult.data || [];
  const choices = choicesResult.data || [];
  const users = usersResult.data || [];

  if (submissionsResult.error || choicesResult.error || usersResult.error) {
    console.error("Error fetching analytics data:", {
      submissions: submissionsResult.error,
      choices: choicesResult.error,
      users: usersResult.error,
    });
  }

  // Fetch user metadata for all unique user IDs in submissions
  const allUserIds = Array.from(new Set([
    ...submissions.map(s => s.associate_id),
    ...submissions.flatMap(s => s.notified_manager_ids)
  ]));
  
  const usersWithMetadata = await getUsersWithMetadata(allUserIds);

  return (
    <div className="flex-1 w-full flex flex-col p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Analyze your dealership&apos;s objection patterns and team performance
          </p>
        </div>

        <ReportsAnalytics 
          submissions={submissions}
          choices={choices}
          users={users}
          usersWithMetadata={usersWithMetadata}
        />
      </div>
    </div>
  );
}