import { createClient } from "@/utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    // Query to get all roles
    const { data: roles, error } = await supabase.from("roles").select("*");

    if (error || !roles) {
      throw new Error("Failed to fetch roles");
    }

    return NextResponse.json({ roles });
  } catch (error: any) {
    console.error("Error fetching roles:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}