"use client";

import { useState } from "react";
import { Bell, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserWithMetadata } from "@/lib/user-utils";
import { resolveAlertAction } from "@/app/actions";

interface Submission {
  id: number;
  associate_id: string;
  choices: number[];
  comment?: string;
  notified_manager_ids: string[];
  created_at: string;
  resolved: boolean;
}

interface Choice {
  id: number;
  description: string;
}

interface AlertsViewProps {
  submissions: Submission[];
  choices: Choice[];
  usersWithMetadata: UserWithMetadata[];
  currentManagerId: string;
}

const getPriorityFromTime = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  
  if (diffMinutes <= 5) return { level: 'high', label: 'high priority' };
  if (diffMinutes <= 15) return { level: 'medium', label: 'medium priority' };
  return { level: 'low', label: 'low priority' };
};

const getTimeAgo = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

const priorityStyles = {
  high: {
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: 'text-red-600'
  },
  medium: {
    bg: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: 'text-yellow-600'
  },
  low: {
    bg: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: 'text-green-600'
  }
};

export function AlertsView({ 
  submissions: initialSubmissions, 
  choices, 
  usersWithMetadata,
  currentManagerId 
}: AlertsViewProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [resolving, setResolving] = useState<number | null>(null);

  // Filter out resolved submissions
  const activeSubmissions = submissions.filter(s => !s.resolved);

  const handleResolve = async (submissionId: number) => {
    setResolving(submissionId);

    try {
      const formData = new FormData();
      formData.append("submissionId", submissionId.toString());

      const result = await resolveAlertAction(formData);
      
      if (result.success) {
        // Remove the resolved submission from the list
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      } else {
        console.error("Failed to resolve alert:", result.error);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    } finally {
      setResolving(null);
    }
  };

  const getChoiceDescription = (choiceId: number) => {
    const choice = choices.find(c => c.id === choiceId);
    return choice?.description || `Choice ${choiceId}`;
  };

  const getAssociateName = (associateId: string) => {
    const user = usersWithMetadata.find(u => u.id === associateId);
    return user?.full_name || `Associate ${associateId.slice(-8)}`;
  };

  return (
    <div className="flex-1 w-full flex flex-col p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Current Alerts</h1>
            <p className="text-muted-foreground">
              <span className="text-red-600 font-semibold">{activeSubmissions.length} Active</span>
            </p>
          </div>
        </div>

        {/* Alerts List */}
        {activeSubmissions.length > 0 ? (
          <div className="space-y-4">
            {activeSubmissions.map((submission) => {
              const priority = getPriorityFromTime(submission.created_at);
              const timeAgo = getTimeAgo(submission.created_at);
              const associateName = getAssociateName(submission.associate_id);
              const isResolving = resolving === submission.id;
              
              // Get objection descriptions
              const objections = submission.choices.map(choiceId => 
                getChoiceDescription(choiceId)
              );

              return (
                <div 
                  key={submission.id}
                  className={`border rounded-lg p-6 ${priorityStyles[priority.level as keyof typeof priorityStyles].bg}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${
                        priority.level === 'high' ? 'bg-red-100' :
                        priority.level === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        {priority.level === 'high' ? (
                          <AlertTriangle className={`h-4 w-4 ${priorityStyles[priority.level as keyof typeof priorityStyles].icon}`} />
                        ) : (
                          <Clock className={`h-4 w-4 ${priorityStyles[priority.level as keyof typeof priorityStyles].icon}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{associateName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          priorityStyles[priority.level as keyof typeof priorityStyles].badge
                        }`}>
                          {priority.label}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleResolve(submission.id)}
                      disabled={isResolving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isResolving ? "Resolving..." : "Resolve"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <User className="h-4 w-4" />
                    <span>Salesperson: {associateName}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{timeAgo}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Objection:</h4>
                      <div className="space-y-1">
                        {objections.map((objection, index) => (
                          <p key={index} className="text-sm">
                            {objections.length > 1 ? `• ${objection}` : objection}
                          </p>
                        ))}
                      </div>
                    </div>

                    {submission.comment && (
                      <div>
                        <h4 className="font-semibold mb-2">Notes:</h4>
                        <p className="text-sm">{submission.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No active alerts at the moment. You&apos;ll see new submissions from your team here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}