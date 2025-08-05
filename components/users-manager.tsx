"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Message {
  type: 'success' | 'error';
  text: string;
  id: number;
}

interface DealershipUser {
  id: string;
  role: string;
  created_at: string;
  dealership_id: string;
  email: string;
  first_name: string;
  last_name: string;
  last_sign_in_at: string;
}

interface UsersManagerProps {
  initialUsers: DealershipUser[];
  currentUserId: string;
  dealershipId: string;
  storePin: number;
}

export function UsersManager({ initialUsers, currentUserId, dealershipId, storePin }: UsersManagerProps) {
  const [users, setUsers] = useState<DealershipUser[]>(initialUsers);
  const [messages, setMessages] = useState<Message[]>([]);

  const supabase = createClient();

  // Message system
  const showMessage = (type: 'success' | 'error', text: string) => {
    const message: Message = { type, text, id: Date.now() };
    setMessages(prev => [...prev, message]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== message.id));
    }, 4000);
  };

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // Real-time subscription for profile changes
  useEffect(() => {
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `dealership_id=eq.${dealershipId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProfile = payload.new as any;
            const newUser: DealershipUser = {
              id: newProfile.id,
              role: newProfile.role,
              created_at: newProfile.created_at,
              dealership_id: newProfile.dealership_id,
              email: `user-${newProfile.id.slice(0, 8)}@dealership.com`,
              first_name: "New",
              last_name: "User",
              last_sign_in_at: new Date().toISOString()
            };
            setUsers(prev => [...prev, newUser]);
          } else if (payload.eventType === 'UPDATE') {
            setUsers(prev =>
              prev.map(user =>
                user.id === payload.new.id 
                  ? { ...user, role: payload.new.role }
                  : user
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setUsers(prev => prev.filter(user => user.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, dealershipId]);


  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUserId && newRole !== "manager") {
      showMessage('error', 'You cannot change your own role');
      return;
    }

    // Store original for rollback
    const originalUser = users.find(user => user.id === userId);
    if (!originalUser) return;

    // Optimistic update
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .eq('dealership_id', dealershipId);

      if (error) throw error;

      showMessage('success', 'User role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      // Rollback
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? originalUser : user
        )
      );
      showMessage('error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUserId) {
      showMessage('error', 'You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    // Store original for rollback
    const originalUser = users.find(user => user.id === userId);
    if (!originalUser) return;

    // Optimistic update
    setUsers(prev => prev.filter(user => user.id !== userId));

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .eq('dealership_id', dealershipId);

      if (error) throw error;

      showMessage('success', 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      // Rollback
      setUsers(prev => [...prev, originalUser]);
      showMessage('error', 'Failed to delete user');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{message.text}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMessage(message.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* User Signup Information */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Add New Users</h2>
            <p className="text-muted-foreground">
              How to add new team members to your dealership
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">For Associates:</h3>
            <p className="text-sm text-blue-800 mb-2">
              New associates can sign up themselves using your store PIN: <strong>{storePin}</strong>
            </p>
            <p className="text-xs text-blue-700">
              Share the signup link and PIN with new team members so they can create their own accounts.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">For Managers:</h3>
            <p className="text-sm text-green-800 mb-2">
              After associates sign up, you can promote them to managers using the role dropdown below.
            </p>
            <p className="text-xs text-green-700">
              Only existing managers can change user roles and manage the team.
            </p>
          </div>
        </div>
      </div>

      {/* Current Users */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Current Users</h2>
            <p className="text-muted-foreground">
              Manage existing users and their permissions
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Add your first user above.
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-muted/30 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'manager' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {getTimeAgo(user.last_sign_in_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                      disabled={user.id === currentUserId}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="associate">Associate</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                      disabled={user.id === currentUserId}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}