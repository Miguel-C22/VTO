import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDealershipsAction,
  joinDealershipAction,
  goBackToPathSelectionAction,
} from "@/app/actions";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface Dealership {
  id: string;
  name: string;
}

interface JoinDealershipPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function DealershipSelector() {
  const result = await getDealershipsAction();

  if (!result.success) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        {result.error}
      </div>
    );
  }

  const dealerships = result.data || [];

  return (
    <Select name="dealershipId" required>
      <SelectTrigger className="w-full h-12 px-4 text-gray-500">
        <SelectValue placeholder="Choose your dealership" />
      </SelectTrigger>
      <SelectContent>
        {dealerships.map((dealership: Dealership) => (
          <SelectItem key={dealership.id} value={dealership.id}>
            {dealership.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default async function JoinDealershipPage({
  searchParams,
}: JoinDealershipPageProps) {
  const params = await searchParams;
  const error = params.error as string;
  const message = params.message as string;

  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to sign-in
  if (authError || !user) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        {/* Header */}
        <div className="mb-8">
          <form action={goBackToPathSelectionAction}>
            <button
              type="submit"
              className="mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </form>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Join Dealership
          </h1>
          <p className="text-gray-600">Connect with your team</p>
        </div>

        {/* Form */}
        <form action={joinDealershipAction} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Select Dealership
            </Label>
            <Suspense
              fallback={
                <div className="w-full h-12 px-4 border rounded-md flex items-center text-gray-500">
                  Loading dealerships...
                </div>
              }
            >
              <DealershipSelector />
            </Suspense>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Dealership PIN
            </Label>
            <Input
              type="number"
              name="pin"
              placeholder="Enter 6-digit PIN"
              maxLength={6}
              className="h-12 px-4"
              required
            />
            <p className="text-sm text-gray-500">
              Contact your manager for the dealership PIN
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              formAction={goBackToPathSelectionAction}
              className="flex-1 h-12"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
            >
              Join Dealership
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
