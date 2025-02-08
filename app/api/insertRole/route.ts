import { createClient } from '@/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 function

interface Role {
  id: string; // Add the 'id' field
  role_name: string;
}

export async function POST(req: NextRequest) {
  const rolesToInsert: Role[] = [
    { id: uuidv4(), role_name: 'manager' },
    { id: uuidv4(), role_name: 'associate' },
  ];

  try {
    // Get Supabase client
    const supabase = createClient();

    // Insert roles into the Supabase 'roles' table
    const { data, error } = await supabase
      .from('roles')
      .upsert(rolesToInsert, { onConflict: 'role_name' }); // Prevent inserting duplicate roles based on 'role_name'

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Roles inserted', data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}