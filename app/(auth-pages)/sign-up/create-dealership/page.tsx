import { createDealershipAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CreateDealership(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
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
      <div className="w-full max-w-2xl">
        <div className="bg-card border rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/path-selection" 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Create Your Dealership
              </h1>
              <p className="text-muted-foreground">
                Set up your dealership information
              </p>
            </div>
          </div>

          <form className="space-y-6" action={createDealershipAction}>
            <div className="space-y-2">
              <Label htmlFor="name">Dealership Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Premium Auto Group"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main Street"
                  required
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="New York"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="NY"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  placeholder="10001"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  placeholder="Ford, Toyota, BMW, etc."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://www.dealership.com"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_pin">Store PIN</Label>
                <Input
                  id="store_pin"
                  name="store_pin"
                  type="text"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  6-digit PIN for employees to join your dealership
                </p>
              </div>
            </div>

            <FormMessage message={searchParams} />

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/path-selection">Back</Link>
              </Button>
              <Button 
                type="submit"
                className="flex-1"
              >
                Create Dealership
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
