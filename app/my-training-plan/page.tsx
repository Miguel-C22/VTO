import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MyTrainingPlanView } from "@/components/my-training-plan-view";
import { getUsersWithMetadata } from "@/lib/user-utils";

export default async function MyTrainingPlanPage() {
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

  // Only associates can access their training plans
  if (profile?.role !== "associate") {
    return redirect("/sales-assist-form");
  }

  if (!profile.dealership_id) {
    return redirect("/sales-assist-form");
  }

  // Get associate's training programs
  const { data: trainingPrograms } = await supabase
    .from("training_programs")
    .select("id, title, type, link, description, priority, estimated_time_minutes, created_at, updated_at, completed")
    .eq("associate_id", user.id)
    .eq("dealership_id", profile.dealership_id)
    .order("completed", { ascending: true }) // Incomplete first
    .order("priority", { ascending: false }) // High priority first
    .order("created_at", { ascending: false });

  // Get associate's submission data for progress tracking
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, choices, comment, created_at, resolved")
    .eq("associate_id", user.id)
    .eq("dealership_id", profile.dealership_id);

  // Get choices for objection analysis
  const { data: choices } = await supabase
    .from("choices")
    .select("*")
    .eq("dealership_id", profile.dealership_id)
    .eq("is_active", true);

  // Get associate metadata
  const associateMetadata = await getUsersWithMetadata([user.id]);
  const associate = associateMetadata[0];

  return (
    <MyTrainingPlanView
      associate={associate}
      trainingPrograms={trainingPrograms || []}
      submissions={submissions || []}
      choices={choices || []}
    />
  );
}