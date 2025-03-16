import getAllUsers from "@/utils/getAllUsers";

export async function fetchManager() {
  try {
    const data = await getAllUsers();

    return data?.manager?.[0]?.auth_email
  } catch (error) {
    console.error("Error fetching manager:", error);
    return null; 
  }
}