import { resend } from './resend';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { emailRateLimiter } from './rate-limiter';

// HTML escaping function to prevent XSS attacks
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'\/]/g, (s) => map[s]);
}

interface Manager {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface EmailNotificationData {
  submissionId: number;
  associateId: string;
  associateName: string;
  associateEmail: string;
  dealershipName: string;
  objectionReasons: string[];
  additionalNotes?: string;
  managerIds: string[];
}

export async function sendManagerNotifications(data: EmailNotificationData) {
  try {
    // Input validation
    if (!data.associateId || !data.associateName || !data.dealershipName || !data.managerIds?.length) {
      return { success: false, error: 'Missing required notification data' };
    }

    // Validate objection reasons array
    if (!Array.isArray(data.objectionReasons) || data.objectionReasons.length === 0) {
      return { success: false, error: 'At least one objection reason is required' };
    }

    // Rate limiting per associate to prevent email spam
    const rateLimitResult = emailRateLimiter.isAllowed(`email-${data.associateId}`);
    
    if (!rateLimitResult.allowed) {
      return { 
        success: false, 
        error: 'Rate limit exceeded. Please wait before sending another notification.',
        resetTime: rateLimitResult.resetTime
      };
    }

    const supabase = await createClient();
    
    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get manager details from the database
    const { data: managers, error: managersError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', data.managerIds)
      .eq('role', 'manager');

    if (managersError || !managers) {
      console.error('Error fetching managers:', managersError);
      return { success: false, error: 'Failed to fetch manager details' };
    }

    // Fetch actual email addresses from Supabase Auth using service client
    const managersWithEmails: Manager[] = [];
    
    for (const manager of managers) {
      try {
        // Get user data from Supabase Auth using admin client
        const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(manager.id);
        
        if (authError) {
          console.error(`Error fetching auth data for manager ${manager.id}:`, authError);
          continue; // Skip this manager if we can't get their auth data
        }

        if (authUser?.user?.email) {
          managersWithEmails.push({
            id: manager.id,
            email: authUser.user.email,
            first_name: authUser.user.user_metadata?.first_name || 'Manager',
            last_name: authUser.user.user_metadata?.last_name || authUser.user.email.split('@')[0]
          });
        }
      } catch (error) {
        console.error(`Error processing manager ${manager.id}:`, error);
        continue;
      }
    }

    if (managersWithEmails.length === 0) {
      console.error('No manager emails found');
      return { success: false, error: 'No manager emails found' };
    }


    const emailPromises = managersWithEmails.map(async (manager) => {
      try {
        // Create HTML email template
        const submissionTime = new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Customer Objection Alert</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <!-- Header -->
                <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">🚨 Customer Objection Alert</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Immediate Manager Assistance Requested
                  </p>
                </div>

                <!-- Content -->
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Hello <strong>${escapeHtml(manager.first_name)} ${escapeHtml(manager.last_name)}</strong>,
                  </p>

                  <p style="font-size: 16px; margin-bottom: 20px;">
                    <strong>${escapeHtml(data.associateName)}</strong> has requested your immediate assistance with a customer objection at <strong>${escapeHtml(data.dealershipName)}</strong>.
                  </p>

                  <!-- Alert Box -->
                  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">
                      ⏰ Time of Request: ${submissionTime}
                    </h3>
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      This is a real-time alert. Please respond as soon as possible.
                    </p>
                  </div>

                  <!-- Objection Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
                      Customer Objection Reasons:
                    </h3>
                    <ul style="padding-left: 20px; margin: 0;">
                      ${data.objectionReasons.map(reason => `
                        <li style="font-size: 16px; margin-bottom: 8px; color: #4b5563;">
                          ${escapeHtml(reason)}
                        </li>
                      `).join('')}
                    </ul>
                  </div>

                  ${data.additionalNotes ? `
                    <!-- Additional Notes -->
                    <div style="margin-bottom: 25px;">
                      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
                        Additional Notes:
                      </h3>
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                        <p style="margin: 0; font-size: 16px; color: #4b5563; font-style: italic;">
                          "${escapeHtml(data.additionalNotes)}"
                        </p>
                      </div>
                    </div>
                  ` : ''}

                  <!-- Associate Contact -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
                      Associate Contact:
                    </h3>
                    <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px;">
                      <p style="margin: 0 0 5px 0; font-size: 16px;">
                        <strong>Name:</strong> ${escapeHtml(data.associateName)}
                      </p>
                      <p style="margin: 0; font-size: 16px;">
                        <strong>Email:</strong> <a href="mailto:${escapeHtml(data.associateEmail)}" style="color: #0ea5e9;">${escapeHtml(data.associateEmail)}</a>
                      </p>
                    </div>
                  </div>

                  <!-- Call to Action -->
                  <div style="text-align: center; margin-top: 30px;">
                    <div style="background-color: #dc2626; color: white; padding: 15px 30px; border-radius: 6px; display: inline-block;">
                      <p style="margin: 0; font-size: 16px; font-weight: bold;">
                        🏃‍♂️ Please respond immediately to assist your team member
                      </p>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      This notification was sent from the ${escapeHtml(data.dealershipName)} Sales Enablement System
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">
                      Automated message - please do not reply to this email
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        
        const result = await resend.emails.send({
          from: 'Sales Alert <onboarding@resend.dev>', // Use Resend's default domain for testing
          to: [manager.email],
          subject: `🚨 URGENT: Customer Objection Alert - ${escapeHtml(data.associateName)} needs assistance`,
          html: emailHtml,
          replyTo: data.associateEmail,
        });


        return { managerId: manager.id, success: true, emailId: result.data?.id };
      } catch (emailError) {
        console.error(`Error sending email notification for manager ${manager.id}:`, { 
          errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return { managerId: manager.id, success: false, error: emailError };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    
    const successCount = emailResults.filter(result => result.success).length;
    const totalCount = emailResults.length;


    return {
      success: successCount > 0,
      results: emailResults,
      message: `${successCount}/${totalCount} email notifications sent successfully`
    };

  } catch (error) {
    console.error('Error in sendManagerNotifications:', error);
    return { success: false, error: 'Failed to send email notifications' };
  }
}

// Utility function to get real manager emails (for production use)
export async function getManagerEmails(managerIds: string[]): Promise<Manager[]> {
  try {
    // This would require admin access to get user emails
    // For now, return placeholder data
    return managerIds.map((id, index) => ({
      id,
      email: `manager${index + 1}@dealership.com`,
      first_name: 'Manager',
      last_name: `${index + 1}`
    }));
  } catch (error) {
    console.error('Error fetching manager emails:', error);
    return [];
  }
}