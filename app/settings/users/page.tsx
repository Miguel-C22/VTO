import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UsersManager } from "@/components/users-manager";
import { getUsersWithMetadata } from "@/lib/user-utils";

export default async function UsersSettingsPage() {
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

  // Only managers can access user settings
  if (profile?.role !== "manager") {
    return redirect("/settings/account");
  }

  if (!profile.dealership_id) {
    return redirect("/settings/account");
  }

  // Get all users for this dealership
  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      created_at,
      dealership_id
    `)
    .eq("dealership_id", profile.dealership_id);

  // Get dealership information for store PIN
  const { data: dealership } = await supabase
    .from("dealerships")
    .select("store_pin")
    .eq("id", profile.dealership_id)
    .single();

  if (error) {
    console.error("Error fetching users:", error);
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p className="text-muted-foreground">
            Failed to load users. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Get user metadata for all users
  const userIds = (users || []).map(u => u.id);
  const usersWithMetadata = await getUsersWithMetadata(userIds);

  // Transform users data with real metadata
  const usersWithAuth = (users || []).map((profile) => {
    const metadata = usersWithMetadata.find(u => u.id === profile.id);
    return {
      id: profile.id,
      role: profile.role,
      created_at: profile.created_at,
      dealership_id: profile.dealership_id,
      email: metadata?.email || `user-${profile.id.slice(0, 8)}@dealership.com`,
      first_name: profile.id === user.id ? "You" : (metadata?.first_name || "User"),
      last_name: metadata?.last_name || profile.id.slice(0, 8),
      last_sign_in_at: new Date().toISOString()
    };
  });

  return (
    <UsersManager 
      initialUsers={usersWithAuth} 
      currentUserId={user.id}
      dealershipId={profile.dealership_id}
      storePin={dealership?.store_pin || 0}
    />
  );
}