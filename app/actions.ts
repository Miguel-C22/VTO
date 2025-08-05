"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const signUpAction = async (formData: FormData) => {
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return encodedRedirect("error", "/sign-up", "All fields are required");
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/sign-up", "Passwords do not match");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?redirect_to=/path-selection`,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

// Create Dealership and whoever created the dealership there profile will then be created and will be automatically assigned manager
export const createDealershipAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const city = formData.get("city")?.toString();
  const state = formData.get("state")?.toString();
  const zip_code = formData.get("zip_code")?.toString();
  const manufacturer = formData.get("manufacturer")?.toString();
  const website = formData.get("website")?.toString();
  const store_pin = formData.get("store_pin")?.toString();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "You must be logged in to create a dealership"
    );
  }

  if (!name || !address || !city || !state || !zip_code || !store_pin) {
    return encodedRedirect(
      "error",
      "/sign-up/create-dealership",
      "All required fields must be filled out"
    );
  }

  // Validate store PIN format
  if (!/^\d{6}$/.test(store_pin)) {
    return encodedRedirect(
      "error",
      "/sign-up/create-dealership",
      "Store PIN must be exactly 6 digits"
    );
  }

  // Check if store PIN already exists
  const { data: existingPin } = await supabase
    .from("dealerships")
    .select("id")
    .eq("store_pin", store_pin)
    .single();

  if (existingPin) {
    return encodedRedirect(
      "error",
      "/sign-up/create-dealership",
      "This store PIN is already in use. Please choose a different one."
    );
  }

  // Create the dealership record
  const { data: dealership, error: dealershipError } = await supabase
    .from("dealerships")
    .insert({
      name,
      address,
      city,
      state,
      zip_code,
      manufacturer: manufacturer || null,
      website: website || null,
      store_pin,
    })
    .select()
    .single();

  if (dealershipError) {
    console.error("Dealership creation error:", dealershipError);
    return encodedRedirect(
      "error",
      "/sign-up/create-dealership",
      "Failed to create dealership. Please try again."
    );
  }

  // Create user profile with dealership_id and manager role
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    role: "manager",
    dealership_id: dealership.id,
  });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    return encodedRedirect(
      "error",
      "/sign-up/create-dealership",
      "Dealership created but failed to set up user profile. Please contact support."
    );
  }

  return redirect("/sales-assist-form");
};

export const getDealershipsAction = async () => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("dealerships")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching dealerships:", error);
      return { success: false, error: "Failed to fetch dealerships" };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching dealerships:", error);
    return { success: false, error: "Failed to fetch dealerships" };
  }
};

export const joinDealershipAction = async (formData: FormData) => {
  const dealershipId = formData.get("dealershipId")?.toString();
  const pin = Number(formData.get("pin"));

  const supabase = await createClient();

  if (!dealershipId || !pin) {
    console.error("Missing data:", { dealershipId, pin });
    return encodedRedirect(
      "error",
      "/sign-up/join-dealership",
      "Please select a dealership and enter the PIN"
    );
  }

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "You must be logged in to join a dealership"
      );
    }

    // Verify dealership exists
    const { error: dealershipError } = await supabase
      .from("dealerships")
      .select("id")
      .eq("id", dealershipId)
      .single();

    if (dealershipError) {
      return encodedRedirect(
        "error",
        "/sign-up/join-dealership",
        "Invalid dealership selected"
      );
    }

    // Check if PIN matches the dealership's PIN
    const { data: dealershipData, error: pinCheckError } = await supabase
      .from("dealerships")
      .select("store_pin")
      .eq("id", dealershipId)
      .single();

    if (pinCheckError) {
      console.error("PIN check error:", pinCheckError);
      return encodedRedirect(
        "error",
        "/sign-up/join-dealership",
        "Error validating dealership PIN"
      );
    }

    if (!dealershipData) {
      console.error("No dealership data found for ID:", dealershipId);
      return encodedRedirect(
        "error",
        "/sign-up/join-dealership",
        "Dealership not found"
      );
    }

    if (dealershipData.store_pin !== pin) {
      console.error(
        "PIN mismatch. Expected:",
        dealershipData.store_pin,
        "Got:",
        pin
      );
      return encodedRedirect(
        "error",
        "/sign-up/join-dealership",
        "Invalid PIN for this dealership"
      );
    }

    // Create or update profile for the user
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role: "associate",
      dealership_id: dealershipId,
    });

    if (profileError) {
      if (profileError.code === "23505") {
        // Profile already exists, update it
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            role: "associate",
            dealership_id: dealershipId,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
          return encodedRedirect(
            "error",
            "/sign-up/join-dealership",
            `Failed to update profile: ${updateError.message}`
          );
        }
      } else {
        console.error("Profile creation error:", profileError);
        return encodedRedirect(
          "error",
          "/sign-up/join-dealership",
          `Failed to create profile: ${profileError.message}`
        );
      }
    } else {
      }

    // Give a moment for the database transaction to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    redirect("/sales-assist-form");
  } catch (error: any) {
    // Next.js redirect() throws a NEXT_REDIRECT error by design - let it through
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error joining dealership:", error);
    return encodedRedirect(
      "error",
      "/sign-up/join-dealership",
      `Failed to join dealership: ${error.message || error.toString()}`
    );
  }
};

export const goBackToPathSelectionAction = async () => {
  redirect("/path-selection");
};

export const updateProfileAction = async (formData: FormData) => {
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();

  const supabase = await createClient();

  if (!firstName || !lastName) {
    return encodedRedirect(
      "error",
      "/settings/account",
      "First name and last name are required"
    );
  }

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "You must be logged in to update your profile"
      );
    }

    // Update user metadata (first_name, last_name)
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (metadataError) {
      console.error("Metadata update error:", metadataError);
      return encodedRedirect(
        "error",
        "/settings/account",
        `Failed to update profile: ${metadataError.message}`
      );
    }


    // Revalidate the settings page to show updated data
    revalidatePath("/settings/account");

    return encodedRedirect(
      "success",
      "/settings/account",
      "Profile updated successfully"
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through (they're not actual errors)
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error updating profile:", error);
    return encodedRedirect(
      "error",
      "/settings/account",
      `Failed to update profile: ${error.message || error.toString()}`
    );
  }
};

export const updatePasswordAction = async (formData: FormData) => {
  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  const supabase = await createClient();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/settings/account",
      "All password fields are required"
    );
  }

  if (newPassword !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/settings/account",
      "New passwords do not match"
    );
  }

  if (newPassword.length < 6) {
    return encodedRedirect(
      "error",
      "/settings/account",
      "Password must be at least 6 characters long"
    );
  }

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "You must be logged in to change your password"
      );
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return encodedRedirect(
        "error",
        "/settings/account",
        "Current password is incorrect"
      );
    }

    // Update password
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (passwordError) {
      console.error("Password update error:", passwordError);
      return encodedRedirect(
        "error",
        "/settings/account",
        `Failed to update password: ${passwordError.message}`
      );
    }

    return encodedRedirect(
      "success",
      "/settings/account",
      "Password updated successfully"
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through (they're not actual errors)
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error updating password:", error);
    return encodedRedirect(
      "error",
      "/settings/account",
      `Failed to update password: ${error.message || error.toString()}`
    );
  }
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
};

// Objection Choices CRUD Actions
export const getObjectionChoicesAction = async () => {
  const supabase = await createClient();

  try {
    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return { success: false, error: "Unauthorized access" };
    }

    // Get choices for this dealership
    const { data: choices, error } = await supabase
      .from("choices")
      .select("id, description, is_active")
      .eq("dealership_id", profile.dealership_id)
      .order("description");

    if (error) {
      console.error("Error fetching objection choices:", error);
      return { success: false, error: "Failed to fetch objection choices" };
    }

    return { success: true, data: choices || [] };
  } catch (error) {
    console.error("Error fetching objection choices:", error);
    return { success: false, error: "Failed to fetch objection choices" };
  }
};

export const addObjectionChoiceAction = async (formData: FormData) => {
  const description = formData.get("description")?.toString();

  if (!description || description.trim().length === 0) {
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Objection reason is required"
    );
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Only managers can add objection choices"
      );
    }

    // Check if choice already exists for this dealership
    const { data: existing } = await supabase
      .from("choices")
      .select("id")
      .eq("dealership_id", profile.dealership_id)
      .eq("description", description.trim())
      .single();

    if (existing) {
      return encodedRedirect(
        "error",
        "/settings/objections",
        "This objection reason already exists"
      );
    }

    // Add new choice
    const { error: insertError } = await supabase.from("choices").insert({
      description: description.trim(),
      dealership_id: profile.dealership_id,
      is_active: true,
    });

    if (insertError) {
      console.error("Error adding objection choice:", insertError);
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Failed to add objection reason"
      );
    }

    revalidatePath("/settings/objections");
    return encodedRedirect(
      "success",
      "/settings/objections",
      "Objection reason added successfully"
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error adding objection choice:", error);
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Failed to add objection reason"
    );
  }
};

export const updateObjectionChoiceAction = async (formData: FormData) => {
  const id = formData.get("id")?.toString();
  const description = formData.get("description")?.toString();

  if (!id || !description || description.trim().length === 0) {
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Invalid data provided"
    );
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Only managers can edit objection choices"
      );
    }

    // Update choice (only if it belongs to this dealership)
    const { error: updateError } = await supabase
      .from("choices")
      .update({ description: description.trim() })
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id);

    if (updateError) {
      console.error("Error updating objection choice:", updateError);
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Failed to update objection reason"
      );
    }

    revalidatePath("/settings/objections");
    return encodedRedirect(
      "success",
      "/settings/objections",
      "Objection reason updated successfully"
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error updating objection choice:", error);
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Failed to update objection reason"
    );
  }
};

export const deleteObjectionChoiceAction = async (formData: FormData) => {
  const id = formData.get("id")?.toString();

  if (!id) {
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Invalid choice ID"
    );
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Only managers can delete objection choices"
      );
    }

    // Delete choice (only if it belongs to this dealership)
    const { error: deleteError } = await supabase
      .from("choices")
      .delete()
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id);

    if (deleteError) {
      console.error("Error deleting objection choice:", deleteError);
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Failed to delete objection reason"
      );
    }

    revalidatePath("/settings/objections");
    return encodedRedirect(
      "success",
      "/settings/objections",
      "Objection reason deleted successfully"
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error deleting objection choice:", error);
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Failed to delete objection reason"
    );
  }
};

export const toggleObjectionChoiceAction = async (formData: FormData) => {
  const id = formData.get("id")?.toString();
  const isActive = formData.get("isActive") === "true";

  if (!id) {
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Invalid choice ID"
    );
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Only managers can toggle objection choices"
      );
    }

    // Toggle choice status (only if it belongs to this dealership)
    const { error: updateError } = await supabase
      .from("choices")
      .update({ is_active: !isActive })
      .eq("id", id)
      .eq("dealership_id", profile.dealership_id);

    if (updateError) {
      console.error("Error toggling objection choice:", updateError);
      return encodedRedirect(
        "error",
        "/settings/objections",
        "Failed to toggle objection reason status"
      );
    }

    revalidatePath("/settings/objections");
    return encodedRedirect(
      "success",
      "/settings/objections",
      `Objection reason ${!isActive ? "activated" : "deactivated"} successfully`
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error toggling objection choice:", error);
    return encodedRedirect(
      "error",
      "/settings/objections",
      "Failed to toggle objection reason status"
    );
  }
};

// Dealership Management Actions
export const getDealershipAction = async () => {
  const supabase = await createClient();

  try {
    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return { success: false, error: "Unauthorized access" };
    }

    // Get dealership information
    const { data: dealership, error } = await supabase
      .from("dealerships")
      .select("*")
      .eq("id", profile.dealership_id)
      .single();

    if (error) {
      console.error("Error fetching dealership:", error);
      return {
        success: false,
        error: "Failed to fetch dealership information",
      };
    }

    return { success: true, data: dealership };
  } catch (error) {
    console.error("Error fetching dealership:", error);
    return { success: false, error: "Failed to fetch dealership information" };
  }
};

export const updateDealershipAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const city = formData.get("city")?.toString();
  const state = formData.get("state")?.toString();
  const zip_code = formData.get("zip_code")?.toString();
  const manufacturer = formData.get("manufacturer")?.toString();
  const website = formData.get("website")?.toString();
  const store_pin = formData.get("store_pin")?.toString();

  if (!name || !address || !city || !state || !zip_code) {
    return encodedRedirect(
      "error",
      "/settings/general",
      "Name, address, city, state, and zip code are required"
    );
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/general",
        "Only managers can update dealership information"
      );
    }

    // Update dealership
    const { error: updateError } = await supabase
      .from("dealerships")
      .update({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip_code: zip_code.trim(),
        manufacturer: manufacturer?.trim() || null,
        website: website?.trim() || null,
        store_pin: store_pin ? parseInt(store_pin) : 0,
      })
      .eq("id", profile.dealership_id);

    if (updateError) {
      console.error("Error updating dealership:", updateError);
      return encodedRedirect(
        "error",
        "/settings/general",
        "Failed to update dealership information"
      );
    }

    revalidatePath("/settings/general");
    return encodedRedirect(
      "success",
      "/settings/general",
      "Dealership information updated successfully"
    );
  } catch (error: any) {
    // Allow NEXT_REDIRECT errors to pass through
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error updating dealership:", error);
    return encodedRedirect(
      "error",
      "/settings/general",
      "Failed to update dealership information"
    );
  }
};

// User Management Actions
export const getDealershipUsersAction = async () => {
  const supabase = await createClient();

  try {
    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return { success: false, error: "Unauthorized access" };
    }

    // Get all users for this dealership
    const { data: users, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        role,
        created_at,
        dealership_id
      `
      )
      .eq("dealership_id", profile.dealership_id);

    if (error) {
      console.error("Error fetching users:", error);
      return { success: false, error: "Failed to fetch users" };
    }

    // Get the current user's auth data to populate their real info
    const currentUser = await supabase.auth.getUser();

    // Transform profiles to include available user data
    const usersWithAuth = users.map((profile) => {
      // For the current user, use their real auth data
      if (profile.id === currentUser.data.user?.id) {
        return {
          id: profile.id,
          role: profile.role,
          created_at: profile.created_at,
          dealership_id: profile.dealership_id,
          email:
            currentUser.data.user?.email ||
            `user-${profile.id.slice(0, 8)}@dealership.com`,
          first_name: currentUser.data.user?.user_metadata?.first_name || "You",
          last_name: currentUser.data.user?.user_metadata?.last_name || "",
          last_sign_in_at:
            currentUser.data.user?.last_sign_in_at || new Date().toISOString(),
        };
      }

      // For other users, show placeholder data
      return {
        id: profile.id,
        role: profile.role,
        created_at: profile.created_at,
        dealership_id: profile.dealership_id,
        email: `user-${profile.id.slice(0, 8)}@dealership.com`,
        first_name: "Team",
        last_name: "Member",
        last_sign_in_at: new Date(profile.created_at).toISOString(),
      };
    });

    return { success: true, data: usersWithAuth };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
};

export const addDealershipUserAction = async (formData: FormData) => {
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const email = formData.get("email")?.toString();
  const role = formData.get("role")?.toString();

  if (!firstName || !lastName || !email || !role) {
    return encodedRedirect(
      "error",
      "/settings/users",
      "All fields are required"
    );
  }

  if (!["associate", "manager"].includes(role)) {
    return encodedRedirect("error", "/settings/users", "Invalid role selected");
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/users",
        "Only managers can add users"
      );
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return encodedRedirect(
        "error",
        "/settings/users",
        "Server configuration error: Service role key not found"
      );
    }


    // Create admin client with service role key
    const { createClient: createSupabaseClient } = await import(
      "@supabase/supabase-js"
    );
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate a temporary password
    const tempPassword = `temp${Math.random().toString(36).slice(2)}!`;

    // Create the auth user using admin API with app metadata for role/dealership
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Skip email confirmation for admin-created users
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
        app_metadata: {
          role: role,
          dealership_id: profile.dealership_id,
        },
      });


    if (createError || !newUser.user) {
      console.error("Error creating auth user:", createError);
      return encodedRedirect(
        "error",
        "/settings/users",
        `Failed to create user: ${createError?.message || "Unknown error"}`
      );
    }


    // Wait for the database trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update the profile with the correct role and dealership
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: role,
        dealership_id: profile.dealership_id,
      })
      .eq("id", newUser.user.id);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      // If profile update fails, still continue as the user was created
    }

    revalidatePath("/settings/users");
    return encodedRedirect(
      "success",
      "/settings/users",
      `${firstName} ${lastName} added successfully with temporary password: ${tempPassword}`
    );
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error adding user:", error);
    return encodedRedirect("error", "/settings/users", "Failed to add user");
  }
};

export const updateUserRoleAction = async (formData: FormData) => {
  const userId = formData.get("userId")?.toString();
  const newRole = formData.get("role")?.toString();

  if (!userId || !newRole) {
    return encodedRedirect("error", "/settings/users", "Invalid request");
  }

  if (!["associate", "manager"].includes(newRole)) {
    return encodedRedirect("error", "/settings/users", "Invalid role selected");
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/users",
        "Only managers can update user roles"
      );
    }

    // Prevent self-demotion
    if (userId === user.id && newRole !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/users",
        "You cannot change your own role"
      );
    }

    // Update user role
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .eq("dealership_id", profile.dealership_id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return encodedRedirect(
        "error",
        "/settings/users",
        "Failed to update user role"
      );
    }

    revalidatePath("/settings/users");
    return encodedRedirect(
      "success",
      "/settings/users",
      "User role updated successfully"
    );
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error updating user role:", error);
    return encodedRedirect(
      "error",
      "/settings/users",
      "Failed to update user role"
    );
  }
};

export const deleteUserAction = async (formData: FormData) => {
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    return encodedRedirect("error", "/settings/users", "Invalid user ID");
  }

  try {
    const supabase = await createClient();

    // Get current user and their dealership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return encodedRedirect("error", "/sign-in", "You must be logged in");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.role !== "manager") {
      return encodedRedirect(
        "error",
        "/settings/users",
        "Only managers can delete users"
      );
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return encodedRedirect(
        "error",
        "/settings/users",
        "You cannot delete your own account"
      );
    }

    // Delete user profile (in real app, you'd also delete the auth user)
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)
      .eq("dealership_id", profile.dealership_id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return encodedRedirect(
        "error",
        "/settings/users",
        "Failed to delete user"
      );
    }

    revalidatePath("/settings/users");
    return encodedRedirect(
      "success",
      "/settings/users",
      "User deleted successfully"
    );
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error deleting user:", error);
    return encodedRedirect("error", "/settings/users", "Failed to delete user");
  }
};

// Sales Form Submission Action
export async function submitSalesFormAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile and dealership
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id) {
      return { success: false, error: "User profile not found" };
    }

    // Parse form data
    const choicesData = formData.get("choices") as string;
    const managersData = formData.get("managers") as string;
    const comment = formData.get("comment") as string;

    let selectedChoices: number[];
    let selectedManagers: string[];

    try {
      selectedChoices = JSON.parse(choicesData);
      selectedManagers = JSON.parse(managersData);
    } catch (parseError) {
      return { success: false, error: "Invalid form data" };
    }

    if (selectedChoices.length === 0) {
      return {
        success: false,
        error: "Please select at least one objection reason",
      };
    }

    if (selectedManagers.length === 0) {
      return {
        success: false,
        error: "Please select at least one manager to notify",
      };
    }

    // Verify that selected managers belong to the same dealership
    const { data: managerProfiles, error: managerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("dealership_id", profile.dealership_id)
      .eq("role", "manager")
      .in("id", selectedManagers);

    if (
      managerError ||
      !managerProfiles ||
      managerProfiles.length !== selectedManagers.length
    ) {
      return { success: false, error: "Invalid manager selection" };
    }

    // Create notification flags (all true for now)
    const notifyFlags = new Array(selectedManagers.length).fill(true);

    // Insert submission
    const { data: submissionData, error: insertError } = await supabase
      .from("submissions")
      .insert({
        associate_id: user.id,
        dealership_id: profile.dealership_id,
        choices: selectedChoices,
        comment: comment || null,
        notified_manager_ids: selectedManagers,
        notify_flags: notifyFlags,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating submission:", insertError);
      return { success: false, error: "Failed to submit request" };
    }

    // Send email notifications to managers
    try {
      // Get dealership name and objection descriptions for email
      const { data: dealership } = await supabase
        .from("dealerships")
        .select("name")
        .eq("id", profile.dealership_id)
        .single();

      const { data: choiceDescriptions } = await supabase
        .from("choices")
        .select("description")
        .in("id", selectedChoices);

      // Get user metadata for associate info
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const associateName =
        authUser?.user_metadata?.first_name &&
        authUser?.user_metadata?.last_name
          ? `${authUser.user_metadata.first_name} ${authUser.user_metadata.last_name}`
          : authUser?.email?.split("@")[0] || "Associate";

      // Import email service dynamically to avoid issues
      const { sendManagerNotifications } = await import("@/lib/email-service");

      const emailResult = await sendManagerNotifications({
        submissionId: submissionData.id,
        associateId: user.id,
        associateName,
        associateEmail: authUser?.email || "no-email@dealership.com",
        dealershipName: dealership?.name || "Your Dealership",
        objectionReasons: choiceDescriptions?.map((c) => c.description) || [],
        additionalNotes: comment || undefined,
        managerIds: selectedManagers,
      });


      if (!emailResult.success) {
        console.error("Error sending email notifications:", emailResult.error);
        // Don't fail the submission if emails fail - just log it
      } else {
      }
    } catch (emailError) {
      console.error("Error in email notification process:", emailError);
      // Don't fail the submission if emails fail
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting sales form:", error);
    return { success: false, error: "Failed to submit request" };
  }
}

// Reset Configuration Management Action
export async function updateResetConfigurationAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile and dealership
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id || profile.role !== "manager") {
      return { success: false, error: "Insufficient permissions" };
    }

    // Parse form data
    const resetType = formData.get("reset_type") as string;
    const resetTime = formData.get("reset_time") as string;
    const dealershipId = formData.get("dealershipId") as string;

    if (!resetType || !resetTime || !dealershipId) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate values
    const validTypes = ["daily", "weekly", "monthly", "yearly"];
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!validTypes.includes(resetType)) {
      return { success: false, error: "Invalid reset type" };
    }

    if (!timeRegex.test(resetTime)) {
      return { success: false, error: "Invalid reset time format" };
    }

    // Convert time to full format (HH:MM:SS) for TIME column
    const fullResetTime = resetTime + ":00";

    // Check if configuration exists
    const { data: existingConfig } = await supabase
      .from("reset_configurations")
      .select("id")
      .eq("dealership_id", dealershipId)
      .single();

    if (existingConfig) {
      // Update existing configuration
      const { error: updateError } = await supabase
        .from("reset_configurations")
        .update({
          reset_type: resetType,
          reset_time: fullResetTime,
          updated_at: new Date().toISOString(),
        })
        .eq("dealership_id", dealershipId);

      if (updateError) {
        console.error("Error updating reset configuration:", updateError);
        return { success: false, error: "Failed to update configuration" };
      }
    } else {
      // Insert new configuration
      const { error: insertError } = await supabase
        .from("reset_configurations")
        .insert({
          dealership_id: dealershipId,
          reset_type: resetType,
          reset_time: fullResetTime,
          last_reset: "2024-01-01", // Required field, set to start of year
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating reset configuration:", insertError);
        return { success: false, error: "Failed to create configuration" };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateResetConfigurationAction:", error);
    return { success: false, error: "Failed to update configuration" };
  }
}

// Manual Reset Action - Immediately clears all report data for a dealership
export async function executeManualResetAction(dealershipId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile and verify permissions
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id || profile.role !== "manager") {
      return { success: false, error: "Only managers can reset reports" };
    }

    // Verify the dealership ID matches the user's dealership
    if (profile.dealership_id !== dealershipId) {
      return {
        success: false,
        error: "You can only reset your own dealership's data",
      };
    }


    // Execute the reset in a transaction-like manner
    // 1. Delete all submissions for this dealership
    const { error: submissionsError } = await supabase
      .from("submissions")
      .delete()
      .eq("dealership_id", dealershipId);

    if (submissionsError) {
      console.error("Error deleting submissions:", submissionsError);
      return { success: false, error: "Failed to clear submission data" };
    }

    // 2. Get all user IDs for this dealership
    const { data: dealershipUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id")
      .eq("dealership_id", dealershipId);

    if (usersError) {
      console.error("Error fetching dealership users:", usersError);
      return { success: false, error: "Failed to identify dealership users" };
    }

    // 3. Delete all user choice totals for dealership users
    if (dealershipUsers && dealershipUsers.length > 0) {
      const userIds = dealershipUsers.map((u) => u.id);
      const { error: choiceTotalsError } = await supabase
        .from("user_choice_totals")
        .delete()
        .in("user_id", userIds);

      if (choiceTotalsError) {
        console.error("Error deleting user choice totals:", choiceTotalsError);
        return { success: false, error: "Failed to clear user statistics" };
      }
    }

    // 4. Update the last_reset date in reset_configurations
    const resetDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const { error: configUpdateError } = await supabase
      .from("reset_configurations")
      .update({
        last_reset: resetDate,
        updated_at: new Date().toISOString(),
      })
      .eq("dealership_id", dealershipId);

    if (configUpdateError) {
      console.error("Error updating reset configuration:", configUpdateError);
      // Don't fail the entire operation for this - it's not critical
    }


    return {
      success: true,
      message: "All reports and submission data have been successfully cleared",
      resetDate,
    };
  } catch (error: any) {
    console.error("Error in executeManualResetAction:", error);
    return { success: false, error: "Failed to execute reset operation" };
  }
}

// Training Program Management Actions
export async function addTrainingProgramAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile and verify permissions
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id || profile.role !== "manager") {
      return {
        success: false,
        error: "Only managers can create training programs",
      };
    }

    // Parse form data
    const associateId = formData.get("associate_id") as string;
    const dealershipId = formData.get("dealership_id") as string;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const link = formData.get("link") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const estimatedTimeStr = formData.get("estimated_time_minutes") as string;

    if (
      !associateId ||
      !dealershipId ||
      !title ||
      !type ||
      !link ||
      !priority
    ) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate values
    const validTypes = ["video", "document", "article", "performance_goal"];
    const validPriorities = ["low", "medium", "high"];

    if (!validTypes.includes(type)) {
      return { success: false, error: "Invalid training type" };
    }

    if (!validPriorities.includes(priority)) {
      return { success: false, error: "Invalid priority level" };
    }

    // Verify the associate belongs to the same dealership
    const { data: associateProfile } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("id", associateId)
      .single();

    if (!associateProfile || associateProfile.dealership_id !== dealershipId) {
      return {
        success: false,
        error: "Associate not found in your dealership",
      };
    }

    // Parse estimated time if provided
    let estimatedTimeMinutes = null;
    if (estimatedTimeStr && estimatedTimeStr.trim()) {
      const parsed = parseInt(estimatedTimeStr);
      if (!isNaN(parsed) && parsed > 0) {
        estimatedTimeMinutes = parsed;
      }
    }

    // Insert training program
    const { data: trainingProgram, error: insertError } = await supabase
      .from("training_programs")
      .insert({
        associate_id: associateId,
        dealership_id: dealershipId,
        title: title.trim(),
        type,
        link: link.trim(),
        description: description?.trim() || null,
        priority,
        estimated_time_minutes: estimatedTimeMinutes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating training program:", insertError);
      return { success: false, error: "Failed to create training program" };
    }

    return {
      success: true,
      data: trainingProgram,
      message: "Training program added successfully",
    };
  } catch (error: any) {
    console.error("Error in addTrainingProgramAction:", error);
    return { success: false, error: "Failed to create training program" };
  }
}

export async function deleteTrainingProgramAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile and verify permissions
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id || profile.role !== "manager") {
      return {
        success: false,
        error: "Only managers can delete training programs",
      };
    }

    const programId = formData.get("programId") as string;

    if (!programId) {
      return { success: false, error: "Program ID is required" };
    }

    // Delete training program (only if it belongs to this dealership)
    const { error: deleteError } = await supabase
      .from("training_programs")
      .delete()
      .eq("id", programId)
      .eq("dealership_id", profile.dealership_id);

    if (deleteError) {
      console.error("Error deleting training program:", deleteError);
      return { success: false, error: "Failed to delete training program" };
    }

    return {
      success: true,
      message: "Training program deleted successfully",
    };
  } catch (error: any) {
    console.error("Error in deleteTrainingProgramAction:", error);
    return { success: false, error: "Failed to delete training program" };
  }
}

export async function toggleTrainingCompletionAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id) {
      return { success: false, error: "Profile not found" };
    }

    const programId = formData.get("programId") as string;
    const completed = formData.get("completed") === "true";

    if (!programId) {
      return { success: false, error: "Program ID is required" };
    }

    // For associates, they can only toggle completion on their own training programs
    // For managers, they can toggle completion for any program in their dealership
    const whereClause =
      profile.role === "associate"
        ? {
            id: programId,
            associate_id: user.id,
            dealership_id: profile.dealership_id,
          }
        : { id: programId, dealership_id: profile.dealership_id };

    // Toggle training program completion
    const { data: updatedProgram, error: updateError } = await supabase
      .from("training_programs")
      .update({
        completed: completed,
        updated_at: new Date().toISOString(),
      })
      .match(whereClause)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating training program completion:", updateError);
      return { success: false, error: "Failed to update completion status" };
    }

    return {
      success: true,
      data: updatedProgram,
      message: `Training program marked as ${completed ? "completed" : "incomplete"}`,
    };
  } catch (error: any) {
    console.error("Error in toggleTrainingCompletionAction:", error);
    return { success: false, error: "Failed to update completion status" };
  }
}

// Alert Management Actions
export async function resolveAlertAction(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile and verify they are a manager
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.dealership_id || profile.role !== "manager") {
      return { success: false, error: "Only managers can resolve alerts" };
    }

    const submissionId = formData.get("submissionId") as string;

    if (!submissionId) {
      return { success: false, error: "Submission ID is required" };
    }

    // Verify the submission exists and this manager was notified
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("id, notified_manager_ids, dealership_id")
      .eq("id", submissionId)
      .eq("dealership_id", profile.dealership_id)
      .single();

    if (fetchError || !submission) {
      return { success: false, error: "Submission not found" };
    }

    // Check if this manager was notified about this submission
    if (!submission.notified_manager_ids.includes(user.id)) {
      return {
        success: false,
        error: "You are not authorized to resolve this alert",
      };
    }

    // Mark submission as resolved
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        resolved: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .eq("dealership_id", profile.dealership_id);

    if (updateError) {
      console.error("Error resolving submission:", updateError);
      return { success: false, error: "Failed to resolve alert" };
    }

    return {
      success: true,
      message: "Alert resolved successfully",
    };
  } catch (error: any) {
    console.error("Error in resolveAlertAction:", error);
    return { success: false, error: "Failed to resolve alert" };
  }
}
