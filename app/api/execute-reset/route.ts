import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This API endpoint executes scheduled resets for dealerships
// It should be called by a cron job or background service
export async function POST() {
  try {
    // Create admin client with service role
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );


    // Get all reset configurations
    const { data: configs, error: configError } = await supabase
      .from('reset_configurations')
      .select('dealership_id, reset_type, reset_time, last_reset');

    if (configError) {
      console.error('Error fetching reset configurations:', configError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch configurations' 
      }, { status: 500 });
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No reset configurations found',
        processed: 0 
      });
    }

    const now = new Date();
    const resetResults = [];

    // Process each configuration to see if it's due for reset
    for (const config of configs) {
      try {
        const isDue = isResetDue(config, now);
        
        if (isDue) {
          
          const resetResult = await executeAutomatedReset(supabase, config.dealership_id);
          resetResults.push({
            dealership_id: config.dealership_id,
            ...resetResult
          });
        }
      } catch (error) {
        console.error(`Error processing reset for dealership ${config.dealership_id}:`, error);
        resetResults.push({
          dealership_id: config.dealership_id,
          success: false,
          error: 'Processing error'
        });
      }
    }

    const successfulResets = resetResults.filter(r => r.success).length;
    const failedResets = resetResults.filter(r => !r.success).length;


    return NextResponse.json({
      success: true,
      message: `Processed ${resetResults.length} reset operations`,
      results: {
        successful: successfulResets,
        failed: failedResets,
        details: resetResults
      }
    });

  } catch (error) {
    console.error('Error in automated reset endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while processing your request' 
    }, { status: 500 });
  }
}

// Helper function to determine if a reset is due
function isResetDue(config: any, now: Date): boolean {
  const lastReset = new Date(config.last_reset);
  const resetTime = config.reset_time.split(':'); // [HH, MM, SS]
  const resetHour = parseInt(resetTime[0]);
  const resetMinute = parseInt(resetTime[1]);

  // Create the target reset time for today
  const todayResetTime = new Date(now);
  todayResetTime.setHours(resetHour, resetMinute, 0, 0);

  // Check if we've passed the reset time today and haven't reset yet today
  const hasPassedResetTimeToday = now >= todayResetTime;
  const lastResetDate = lastReset.toDateString();
  const todayDate = now.toDateString();

  switch (config.reset_type) {
    case 'daily':
      // Reset daily if we've passed the reset time and haven't reset today
      return hasPassedResetTimeToday && lastResetDate !== todayDate;

    case 'weekly': {
      // Reset weekly on the same day of week as the last reset, at the specified time
      const daysSinceLastReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastReset >= 7 && hasPassedResetTimeToday;
    }

    case 'monthly': {
      // Reset monthly on the same day of month as the last reset, at the specified time
      const currentMonth = now.getMonth();
      const lastResetMonth = lastReset.getMonth();
      const currentYear = now.getFullYear();
      const lastResetYear = lastReset.getFullYear();
      
      // Check if we're in a different month/year and past the reset time
      const isDifferentMonth = currentMonth !== lastResetMonth || currentYear !== lastResetYear;
      const isDayOfMonthPassed = now.getDate() >= lastReset.getDate();
      
      return isDifferentMonth && isDayOfMonthPassed && hasPassedResetTimeToday;
    }

    case 'yearly': {
      // Reset yearly on the same date as the last reset, at the specified time
      const currentYear = now.getFullYear();
      const lastResetYear = lastReset.getFullYear();
      const currentDayOfYear = getDayOfYear(now);
      const lastResetDayOfYear = getDayOfYear(lastReset);
      
      return currentYear > lastResetYear || 
             (currentYear === lastResetYear && currentDayOfYear >= lastResetDayOfYear && hasPassedResetTimeToday);
    }

    default:
      return false;
  }
}

// Helper function to get day of year (1-366)
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Execute the actual reset operation for a dealership
async function executeAutomatedReset(supabase: any, dealershipId: string) {
  try {

    // 1. Delete all submissions for this dealership
    const { error: submissionsError } = await supabase
      .from('submissions')
      .delete()
      .eq('dealership_id', dealershipId);

    if (submissionsError) {
      console.error('Error deleting submissions:', submissionsError);
      return { success: false, error: 'Failed to clear submission data' };
    }

    // 2. Get all user IDs for this dealership
    const { data: dealershipUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('dealership_id', dealershipId);

    if (usersError) {
      console.error('Error fetching dealership users:', usersError);
      return { success: false, error: 'Failed to identify dealership users' };
    }

    // 3. Delete all user choice totals for dealership users
    if (dealershipUsers && dealershipUsers.length > 0) {
      const userIds = dealershipUsers.map((u: any) => u.id);
      const { error: choiceTotalsError } = await supabase
        .from('user_choice_totals')
        .delete()
        .in('user_id', userIds);

      if (choiceTotalsError) {
        console.error('Error deleting user choice totals:', choiceTotalsError);
        return { success: false, error: 'Failed to clear user statistics' };
      }
    }

    // 4. Update the last_reset date in reset_configurations
    const resetDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const { error: configUpdateError } = await supabase
      .from('reset_configurations')
      .update({ 
        last_reset: resetDate,
        updated_at: new Date().toISOString()
      })
      .eq('dealership_id', dealershipId);

    if (configUpdateError) {
      console.error('Error updating reset configuration:', configUpdateError);
      // Don't fail the entire operation for this - it's not critical
    }

    
    return { 
      success: true, 
      message: 'Reset completed successfully',
      resetDate 
    };

  } catch (error) {
    console.error(`Error in executeAutomatedReset for dealership ${dealershipId}:`, error);
    return { success: false, error: 'Reset operation failed' };
  }
}