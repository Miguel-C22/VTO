import { resend } from '@/lib/resend';
import { NextRequest, NextResponse } from 'next/server';
import { emailRateLimiter, getClientIdentifier } from '@/lib/rate-limiter';

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(request);
    const rateLimitResult = emailRateLimiter.isAllowed(clientId);
    
    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime).toISOString();
      return NextResponse.json({
        error: 'Rate limit exceeded. Please try again later.',
        resetTime
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (typeof email !== 'string') {
      return NextResponse.json({ error: 'Email must be a string' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    
    const result = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: [email],
      subject: 'Test Email from Your Dealership App',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #2563eb;">✅ Resend Test Successful!</h1>
          <p>This is a test email to verify that Resend is working correctly.</p>
          <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you received this email, your Resend integration is working!
          </p>
        </div>
      `,
    });


    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ 
        error: 'Failed to send email'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Test email sent successfully!'
    }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing your request'
    }, { status: 500 });
  }
}