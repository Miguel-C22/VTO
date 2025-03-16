import { createClient } from '@/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    const supabase = createClient();
    try {
      const { user_id }: { user_id: string } = await req.json();
  
      const { error } = await supabase
        .from('users_submission')
        .update({ notify: false })
        .eq('user_id', user_id);
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
  
      return NextResponse.json({ message: 'Notify updated successfully' }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  }