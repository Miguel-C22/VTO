import { createClient } from '@/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  try {
    // Fetch all user IDs (you could add a condition if you want to target specific users)
    const { data: users, error: fetchError } = await supabase
      .from('users_choices')
      .select('user_id');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Now update choices for all these users
    const { error } = await supabase
      .from('users_choices')
      .upsert(
        users.map((user: { user_id: string }) => ({
          user_id: user.user_id,
          choices: [],  // Reset choices to an empty array
        }))
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'All users\' choices have been reset successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}