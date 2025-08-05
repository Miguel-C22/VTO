"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { submitSalesFormAction } from "@/app/actions";

interface ObjectionChoice {
  id: number;
  description: string;
  is_active: boolean;
}

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
  id: number;
}

export function SalesAssistForm() {
  const [objectionChoices, setObjectionChoices] = useState<ObjectionChoice[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
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

  // Load objection choices and managers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user profile to determine dealership
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('dealership_id')
          .eq('id', user.id)
          .single();

        if (!profile?.dealership_id) return;

        // Load objection choices for this dealership
        const { data: choices } = await supabase
          .from('choices')
          .select('*')
          .eq('dealership_id', profile.dealership_id)
          .eq('is_active', true)
          .order('description');

        if (choices) {
          setObjectionChoices(choices);
        }

        // Load managers for this dealership and fetch their real metadata
        const { data: managerProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('dealership_id', profile.dealership_id)
          .eq('role', 'manager');

        if (managerProfiles) {
          // Fetch real manager metadata
          try {
            const managerIds = managerProfiles.map(p => p.id);
            const response = await fetch('/api/get-users-metadata', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userIds: managerIds })
            });
            
            if (response.ok) {
              const managersWithMetadata = await response.json();
              setManagers(managersWithMetadata);
            } else {
              // Fallback to placeholder data
              const managersWithDetails = managerProfiles.map((profile, index) => ({
                id: profile.id,
                first_name: `Manager`,
                last_name: `${index + 1}`,
                email: `manager${index + 1}@dealership.com`
              }));
              setManagers(managersWithDetails);
            }
          } catch (error) {
            console.error('Error fetching manager metadata:', error);
            // Fallback to placeholder data
            const managersWithDetails = managerProfiles.map((profile, index) => ({
              id: profile.id,
              first_name: `Manager`,
              last_name: `${index + 1}`,
              email: `manager${index + 1}@dealership.com`
            }));
            setManagers(managersWithDetails);
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        showMessage('error', 'Failed to load form data');
      }
    };

    loadData();
  }, [supabase]);

  const handleChoiceToggle = (choiceId: number) => {
    setSelectedChoices(prev => 
      prev.includes(choiceId) 
        ? prev.filter(id => id !== choiceId)
        : [...prev, choiceId]
    );
  };

  const handleManagerToggle = (managerId: string) => {
    setSelectedManagers(prev => 
      prev.includes(managerId) 
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedChoices.length === 0) {
      showMessage('error', 'Please select at least one objection reason');
      return;
    }
    
    if (selectedManagers.length === 0) {
      showMessage('error', 'Please select at least one manager to notify');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('choices', JSON.stringify(selectedChoices));
      formData.append('managers', JSON.stringify(selectedManagers));
      formData.append('comment', comment);
      
      const result = await submitSalesFormAction(formData);
      
      if (result.success) {
        showMessage('success', 'Request sent to managers successfully!');
        // Reset form
        setSelectedChoices([]);
        setSelectedManagers([]);
        setComment('');
      } else {
        showMessage('error', result.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showMessage('error', 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Messages */}
      {messages.length > 0 && (
        <div className="mb-6 space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-center gap-2 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{message.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Customer Objection Details</h1>
            <p className="text-muted-foreground">
              Select the reasons why the customer doesn&apos;t want to purchase and which managers should be notified
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Objection Choices */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Why doesn&apos;t the customer want to purchase? (Select all that apply)
            </h2>
            
            {objectionChoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No objection choices available. Please contact your manager.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectionChoices.map((choice) => (
                  <div key={choice.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`choice-${choice.id}`}
                      checked={selectedChoices.includes(choice.id)}
                      onCheckedChange={() => handleChoiceToggle(choice.id)}
                    />
                    <Label
                      htmlFor={`choice-${choice.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {choice.description}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manager Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Which managers should be notified? (Select all that apply)
            </h2>
            
            {managers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No managers available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {managers.map((manager) => (
                  <div key={manager.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`manager-${manager.id}`}
                      checked={selectedManagers.includes(manager.id)}
                      onCheckedChange={() => handleManagerToggle(manager.id)}
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {manager.first_name.charAt(0)}{manager.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <Label
                          htmlFor={`manager-${manager.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {manager.first_name} {manager.last_name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{manager.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Additional Notes (Optional)
            </h2>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide any additional context about the customer's concerns..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || selectedChoices.length === 0 || selectedManagers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request to Managers
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
