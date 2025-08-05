import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TrainingPlanManager } from "@/components/training-plan-manager";
import { getUsersWithMetadata } from "@/lib/user-utils";

interface TrainingPlanPageProps {
  params: Promise<{
    associateId: string;
  }>;
}

export default async function TrainingPlanPage({ params }: TrainingPlanPageProps) {
  const { associateId } = await params;
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

  // Only managers can access training plans
  if (profile?.role !== "manager") {
    return redirect("/reports");
  }

  if (!profile.dealership_id) {
    return redirect("/reports");
  }

  // Verify the associate belongs to the same dealership
  const { data: associateProfile } = await supabase
    .from("profiles")
    .select("dealership_id, role")
    .eq("id", associateId)
    .single();

  if (!associateProfile || associateProfile.dealership_id !== profile.dealership_id) {
    return redirect("/reports");
  }

  // Get associate's submission data for performance overview
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, choices, comment, created_at, resolved")
    .eq("associate_id", associateId)
    .eq("dealership_id", profile.dealership_id);

  // Get choices for objection analysis
  const { data: choices } = await supabase
    .from("choices")
    .select("*")
    .eq("dealership_id", profile.dealership_id)
    .eq("is_active", true);

  // Get existing training programs for this associate
  const { data: trainingPrograms } = await supabase
    .from("training_programs")
    .select("id, title, type, link, description, priority, estimated_time_minutes, created_at, updated_at, completed")
    .eq("associate_id", associateId)
    .eq("dealership_id", profile.dealership_id)
    .order("completed", { ascending: true }) // Incomplete first
    .order("created_at", { ascending: false });

  // Get associate metadata
  const associateMetadata = await getUsersWithMetadata([associateId]);
  const associate = associateMetadata[0];

  if (!associate) {
    return redirect("/reports");
  }

  return (
    <TrainingPlanManager
      associate={associate}
      submissions={submissions || []}
      choices={choices || []}
      trainingPrograms={trainingPrograms || []}
      dealershipId={profile.dealership_id}
    />
  );
}