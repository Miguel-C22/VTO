import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ObjectionsManager } from "@/components/objections-manager";

export default async function ObjectionsSettingsPage() {
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

  // Only managers can access objections settings
  if (profile?.role !== "manager") {
    return redirect("/settings/account");
  }

  if (!profile.dealership_id) {
    return redirect("/settings/account");
  }

  // Get initial objection choices
  const { data: choices, error } = await supabase
    .from("choices")
    .select("id, description, is_active, dealership_id")
    .eq("dealership_id", profile.dealership_id)
    .order("description");

  if (error) {
    console.error("Error fetching choices:", error);
  }

  return (
    <ObjectionsManager 
      initialChoices={choices || []} 
      dealershipId={profile.dealership_id} 
    />
  );
}
