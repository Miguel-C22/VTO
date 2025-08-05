import { NextRequest, NextResponse } from 'next/server';
import { getUsersWithMetadata } from '@/lib/user-utils';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to verify they have access
    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.dealership_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { userIds } = await request.json();
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 });
    }

    const usersWithMetadata = await getUsersWithMetadata(userIds);
    
    return NextResponse.json(usersWithMetadata);
  } catch (error) {
    console.error('Error in get-users-metadata API:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing your request' 
    }, { status: 500 });
  }
}