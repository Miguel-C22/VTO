import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DealershipManager } from "@/components/dealership-manager";

export default async function GeneralSettingsPage() {
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

  // Only managers can access general settings
  if (profile?.role !== "manager") {
    return redirect("/settings/account");
  }

  if (!profile.dealership_id) {
    return redirect("/settings/account");
  }

  // Get dealership information
  const { data: dealership, error } = await supabase
    .from("dealerships")
    .select("*")
    .eq("id", profile.dealership_id)
    .single();

  if (error || !dealership) {
    console.error("Error fetching dealership:", error);
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p className="text-muted-foreground">
            Failed to load dealership information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return <DealershipManager initialDealership={dealership} />;
}