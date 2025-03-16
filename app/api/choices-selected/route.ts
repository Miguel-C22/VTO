import { createClient } from '@/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

interface Choice {
  choiceId: string;  // ChoiceId should be string since it's a UUID
  amountSelected: number;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  try {
    // Parse the incoming request body
    const { user_id, new_choices }: { user_id: string; new_choices: Choice[] } = await req.json();

    // Check if the user has already submitted choices
    const { data, error } = await supabase
      .from('users_choices')
      .select('choices')
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let updatedChoices: Choice[] = [];

    if (data && data.length > 0) {
      // If user has choices, update the existing record
      const existingChoices = data[0].choices;

      updatedChoices = existingChoices.map((choice: Choice) => {
        const matchingChoice = new_choices.find(
          (newChoice) => newChoice.choiceId === choice.choiceId
        );
        if (matchingChoice) {
          // Increment the amount selected for existing choices
          choice.amountSelected += matchingChoice.amountSelected;
        }
        return choice;
      });

         // Add new choices that don't exist in the existing choices
        new_choices.forEach((newChoice) => {
            const exists = existingChoices.some(
              (existingChoice: Choice) => existingChoice.choiceId === newChoice.choiceId
            );
            if (!exists) {
              updatedChoices.push(newChoice);
            }
        });

      // Update the user's choices
      const { error: updateError } = await supabase
        .from('users_choices')
        .update({ choices: updatedChoices })
        .eq('user_id', user_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      // If no data exists, insert a new record
      const { error: insertError } = await supabase
        .from('users_choices')
        .insert([{ user_id, choices: new_choices }]);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Choices updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}