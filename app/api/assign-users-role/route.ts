import { createClient } from '@/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    const { user } = await req.json();

    if (!user) {
      throw new Error("User data not provided");
    }

    const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id')
    .eq('role_name', 'associate')  // Make sure 'associate' role exists
    .single();
  
  if (rolesError || !roles) {
    throw new Error("Role not found");
  }
  
  const associateRoleId = roles.id;
  
  const { error: assignError } = await supabase
    .from('user_roles')
    .upsert([
      {
        user_id: user.id,  // User ID
        role_id: associateRoleId,  // Role ID
      },
    ]);
  
  if (assignError) {
    console.error("Error in role assignment:", assignError);
    throw new Error(assignError.message);
  }
  
  return NextResponse.json({ message: 'Role assigned successfully' });
  } catch (error: any) {
    console.error("Error assigning role:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}