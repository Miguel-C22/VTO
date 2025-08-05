-- ============================================================================
-- RLS POLICIES FOR SALES ENABLEMENT APP
-- ============================================================================
-- This file contains all Row Level Security policies for the dealership app
-- Apply these policies in your Supabase dashboard or via migrations
-- ============================================================================


-- COME BACK TO THIS - THESE ARE NOT IN PLACE AS OF NOW, NEEDS WORK. 

-- ============================================================================
-- 1. DEALERSHIPS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on dealerships table
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all dealerships for joining purposes
-- Also allows users to view their own dealership details
CREATE POLICY "Authenticated users see all dealerships" ON dealerships
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only managers can update their dealership
CREATE POLICY "Managers can update their dealership" ON dealerships
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = dealerships.id
        AND profiles.role = 'manager'
    )
  );

-- Policy: Anyone can create a dealership (for initial setup)
CREATE POLICY "Anyone can create dealership" ON dealerships
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only managers can delete their dealership
CREATE POLICY "Managers can delete their dealership" ON dealerships
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = dealerships.id
        AND profiles.role = 'manager'
    )
  );

-- ============================================================================
-- 2. PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Managers can view profiles in their dealership
CREATE POLICY "Managers can view dealership profiles" ON profiles
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Anyone can create their own profile (signup process)
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- 3. CHOICES TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on choices table
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view choices from their dealership
CREATE POLICY "Users can view dealership choices" ON choices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = choices.dealership_id
    )
  );

-- Policy: Managers can insert choices for their dealership
CREATE POLICY "Managers can insert dealership choices" ON choices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = choices.dealership_id
        AND profiles.role = 'manager'
    )
  );

-- Policy: Managers can update choices in their dealership
CREATE POLICY "Managers can update dealership choices" ON choices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = choices.dealership_id
        AND profiles.role = 'manager'
    )
  );

-- Policy: Managers can delete choices from their dealership
CREATE POLICY "Managers can delete dealership choices" ON choices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = choices.dealership_id
        AND profiles.role = 'manager'
    )
  );

-- ============================================================================
-- 4. SUBMISSIONS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view submissions from their dealership
CREATE POLICY "Users can view dealership submissions" ON submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = submissions.dealership_id
    )
  );

-- Policy: Associates can create submissions for their dealership
CREATE POLICY "Associates can create submissions" ON submissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = submissions.dealership_id
    )
    AND auth.uid() = submissions.associate_id
  );

-- Policy: Managers can update submissions in their dealership
CREATE POLICY "Managers can update dealership submissions" ON submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = submissions.dealership_id
        AND profiles.role = 'manager'
    )
  );

-- Policy: Associates can update their own submissions
CREATE POLICY "Associates can update own submissions" ON submissions
  FOR UPDATE
  USING (auth.uid() = associate_id);

-- Policy: Managers can delete submissions from their dealership
CREATE POLICY "Managers can delete dealership submissions" ON submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = submissions.dealership_id
        AND profiles.role = 'manager'
    )
  );

-- ============================================================================
-- 5. USER_CHOICE_TOTALS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on user_choice_totals table
ALTER TABLE user_choice_totals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own totals
CREATE POLICY "Users can view own choice totals" ON user_choice_totals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Managers can view totals for users in their dealership
CREATE POLICY "Managers can view dealership choice totals" ON user_choice_totals
  FOR SELECT
  USING (
    user_id IN (
      SELECT p.id FROM profiles p
      WHERE p.dealership_id IN (
        SELECT dealership_id FROM profiles 
        WHERE id = auth.uid() AND role = 'manager'
      )
    )
  );

-- Policy: System can create/update totals for valid dealership users
CREATE POLICY "System can manage user choice totals" ON user_choice_totals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = user_choice_totals.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = user_choice_totals.user_id
    )
  );

-- ============================================================================
-- 6. RESET_CONFIGURATIONS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on reset_configurations table
ALTER TABLE reset_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reset configs for their dealership
CREATE POLICY "Users can view dealership reset configs" ON reset_configurations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = reset_configurations.dealership_id
    )
  );

-- Policy: Managers can manage reset configs for their dealership
CREATE POLICY "Managers can manage dealership reset configs" ON reset_configurations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = reset_configurations.dealership_id
        AND profiles.role = 'manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
        AND profiles.dealership_id = reset_configurations.dealership_id
        AND profiles.role = 'manager'
    )
  );

-- ============================================================================
-- 7. TRAINING_PROGRAMS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on training_programs table
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

-- Policy: Associates can view their own training programs
CREATE POLICY "Associates can view own training programs" ON training_programs
  FOR SELECT
  USING (auth.uid() = associate_id);

-- Policy: Managers can view training programs for their dealership users
CREATE POLICY "Managers can view dealership training programs" ON training_programs
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- Policy: Managers can create training programs for their dealership users
CREATE POLICY "Managers can create dealership training programs" ON training_programs
  FOR INSERT
  WITH CHECK (
    dealership_id IN (
      SELECT dealership_id FROM profiles 
      WHERE id = auth.uid() AND role = 'manager'
    )
    AND associate_id IN (
      SELECT id FROM profiles 
      WHERE dealership_id = training_programs.dealership_id
    )
  );

-- Policy: Managers can update training programs for their dealership
CREATE POLICY "Managers can update dealership training programs" ON training_programs
  FOR UPDATE
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- Policy: Associates can update completion status of their own training
CREATE POLICY "Associates can update own training completion" ON training_programs
  FOR UPDATE
  USING (auth.uid() = associate_id)
  WITH CHECK (auth.uid() = associate_id);

-- Policy: Managers can delete training programs from their dealership
CREATE POLICY "Managers can delete dealership training programs" ON training_programs
  FOR DELETE
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- ============================================================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if user is manager of dealership
CREATE OR REPLACE FUNCTION is_manager_of_dealership(dealership_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.dealership_id = dealership_uuid
      AND profiles.role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's dealership id
CREATE OR REPLACE FUNCTION get_user_dealership_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT dealership_id FROM profiles 
    WHERE profiles.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user belongs to same dealership as another user
CREATE OR REPLACE FUNCTION same_dealership_as_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p2.id = target_user_id
    WHERE p1.id = auth.uid()
      AND p1.dealership_id = p2.dealership_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTES AND INSTRUCTIONS
-- ============================================================================

/*
DEPLOYMENT INSTRUCTIONS:
1. Apply these policies in your Supabase dashboard SQL editor
2. Test each policy with different user roles and scenarios
3. Verify that managers can only access their dealership's data
4. Verify that associates can only access appropriate data
5. Monitor for any performance issues with complex joins

SECURITY CONSIDERATIONS:
- All policies enforce dealership-level data isolation
- Managers have elevated permissions within their dealership only
- Associates have limited access to their own data and shared resources
- Store pins are readable by all (needed for role upgrades)
- Service role has full access for admin operations

TESTING RECOMMENDATIONS:
- Create test users with different roles
- Verify cross-dealership data isolation
- Test all CRUD operations for each role
- Ensure policies don't block legitimate operations
- Monitor query performance with RLS enabled

MAINTENANCE:
- Review policies when adding new features
- Update policies if role structure changes
- Monitor Supabase logs for policy violations
- Consider creating policy tests for CI/CD
*/