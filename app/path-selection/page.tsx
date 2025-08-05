import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PathSelection() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to sign-in
  if (error || !user) {
    return redirect("/sign-in");
  }

  // Check if user already has a profile with dealership
  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id, role")
    .eq("id", user.id)
    .single();

  // If user already has a complete profile, redirect to appropriate page
  if (profile && profile.dealership_id) {
    if (profile.role === "manager") {
      return redirect("/dashboard");
    } else {
      return redirect("/sales-assist-form");
    }
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to the platform!
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose how you&apos;d like to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create New Dealership Card */}
          <Link href="/sign-up/create-dealership" className="group">
            <div className="bg-card border rounded-xl p-8 h-full hover:shadow-lg transition-all duration-200 hover:border-primary/20 cursor-pointer">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-10 h-10 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-4a2 2 0 012-2h4a2 2 0 012 2v4z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Create New Dealership
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Start your own dealership and manage your inventory, staff, and sales.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Manager Role
                  </div>
                  
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></span>
                      Full administrative access
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></span>
                      Manage team members
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></span>
                      Complete inventory control
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Link>

          {/* Join Existing Dealership Card */}
          <Link href="/sign-up/join-dealership" className="group">
            <div className="bg-card border rounded-xl p-8 h-full hover:shadow-lg transition-all duration-200 hover:border-primary/20 cursor-pointer">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-10 h-10 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Join Existing Dealership
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Connect with an established dealership team and start working immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Associate Role
                  </div>
                  
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></span>
                      Access assigned inventory
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></span>
                      Collaborate with team
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></span>
                      Track your performance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
