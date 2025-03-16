import { createClient } from '@/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

interface Choice {
  choiceId: string;
  amountSelected?: number; // Optional, as it may not be present on initial insert
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  try {
    const { user_id, new_choices, comment }: { user_id: string; new_choices: Choice[]; comment: string } = await req.json();

    const { data, error } = await supabase
      .from('users_submission')
      .select('choices, comment, notify')
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {

      const { error: updateError } = await supabase
        .from('users_submission')
        .update({ choices: new_choices, comment: comment, notify: true })
        .eq('user_id', user_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Submission updated successfully' }, { status: 200 });
    } else {
      // User has not submitted, insert new record
      const { error: insertError } = await supabase
        .from('users_submission')
        .insert([{ user_id, choices: new_choices, comment, notify: true}]);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Submission created successfully' }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}