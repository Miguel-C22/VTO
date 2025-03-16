'use server'

import { createClient } from "@/utils/supabase/client";

export default async function getChoices() {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from("choices")
            .select("id, choice");

        if (error) {
            console.error("Error fetching choices:", error);
            return { error: error.message }; 
        }

        return { choices: data }; 

    } catch (error) {
        console.error("Unexpected error:", error);
        return { error: "An unexpected error occurred" };
    }
}