'use server'

import { createClient } from "@/utils/supabase/client";

export default async function getUsersSelectedChoices() {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from("users_choices")
            .select("user_id, choices");

        if (error) {
            console.error("Error fetching choices:", error);
            return { error: error.message }; 
        }

        return { data }; 

    } catch (error) {
        console.error("Unexpected error:", error);
        return { error: "An unexpected error occurred" };
    }
}