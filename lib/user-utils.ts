import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export interface UserWithMetadata {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role?: string;
}

export async function getUsersWithMetadata(userIds: string[]): Promise<UserWithMetadata[]> {
  if (userIds.length === 0) return [];

  try {
    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const users: UserWithMetadata[] = [];

    // Fetch user metadata from Supabase Auth
    for (const userId of userIds) {
      try {
        const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(userId);
        
        if (authError) {
          console.error(`Error fetching auth data for user ${userId}:`, authError);
          continue;
        }

        if (authUser?.user) {
          const firstName = authUser.user.user_metadata?.first_name || '';
          const lastName = authUser.user.user_metadata?.last_name || '';
          const email = authUser.user.email || '';
          
          users.push({
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            full_name: firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || email.split('@')[0])
          });
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        // Add fallback user data
        users.push({
          id: userId,
          email: `user-${userId.slice(0, 8)}@dealership.com`,
          first_name: 'User',
          last_name: userId.slice(0, 8),
          full_name: `User ${userId.slice(0, 8)}`
        });
      }
    }

    return users;
  } catch (error) {
    console.error('Error in getUsersWithMetadata:', error);
    // Return fallback data
    return userIds.map(userId => ({
      id: userId,
      email: `user-${userId.slice(0, 8)}@dealership.com`,
      first_name: 'User',
      last_name: userId.slice(0, 8),
      full_name: `User ${userId.slice(0, 8)}`
    }));
  }
}

export async function getUserWithMetadata(userId: string): Promise<UserWithMetadata | null> {
  const users = await getUsersWithMetadata([userId]);
  return users[0] || null;
}