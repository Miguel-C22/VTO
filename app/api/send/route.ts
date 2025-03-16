import { NextRequest, NextResponse } from 'next/server';
import { EmailTemplate } from '@/components/EmailTemplate/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND);

export async function POST(req: NextRequest) {
  const { managerEmail, selectedChoices, comment } = await req.json();

  try {
    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [managerEmail], // dynamic recipient email
      subject: 'Hello world',
      react: EmailTemplate({
        managerEmail,
        selectedChoices,
        comment,
      }) as React.ReactElement,
    });

    if (error) {
      console.error('Error from Resend API:', error); // Log error from Resend API
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in email sending logic:', error); // Log any other errors
    return NextResponse.json({ error: error || 'Internal Server Error' }, { status: 500 });
  }
}