import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock } from "lucide-react";
import { updateProfileAction, updatePasswordAction } from "@/app/actions";

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

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

  const error = params.error as string;
  const success = params.success as string;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-8">
          {/* Messages */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5" />
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-muted-foreground">
                  Update your personal information and account details
                </p>
              </div>
            </div>

            <form action={updateProfileAction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    defaultValue={user.user_metadata?.first_name || ""}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    defaultValue={user.user_metadata?.last_name || ""}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact your manager or IT administrator to change your email address
                </p>
              </div>

              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Update Profile
              </Button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-5 w-5" />
              <div>
                <h2 className="text-xl font-semibold">Change Password</h2>
                <p className="text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            <form action={updatePasswordAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  required
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Update Password
              </Button>
            </form>
          </div>

          {/* Account Info Display */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Role: </span>
                <span className="capitalize">{profile?.role || "N/A"}</span>
              </div>
              {profile?.dealership_id && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Dealership ID: </span>
                  <span className="font-mono text-sm">{profile.dealership_id}</span>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
