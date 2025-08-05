"use client";

import { useState, useMemo } from "react";
import { BookOpen, Video, FileText, Globe, Trophy, Clock, CheckCircle, Target, TrendingUp, BarChart3 } from "lucide-react";
import { UserWithMetadata } from "@/lib/user-utils";
import { toggleTrainingCompletionAction } from "@/app/actions";

interface Submission {
  id: number;
  choices: number[];
  comment?: string;
  created_at: string;
  resolved: boolean;
}

interface Choice {
  id: number;
  description: string;
}

interface TrainingProgram {
  id: number;
  title: string;
  type: string;
  link: string;
  description?: string;
  priority: string;
  estimated_time_minutes?: number;
  created_at: string;
  updated_at: string;
  completed: boolean;
}

interface MyTrainingPlanViewProps {
  associate: UserWithMetadata;
  trainingPrograms: TrainingProgram[];
  submissions: Submission[];
  choices: Choice[];
}

const typeIcons = {
  video: Video,
  document: FileText,
  article: Globe,
  performance_goal: Target
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-red-100 text-red-800 border-red-200"
};

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

export function MyTrainingPlanView({ 
  associate, 
  trainingPrograms: initialPrograms, 
  submissions, 
  choices 
}: MyTrainingPlanViewProps) {
  const [trainingPrograms, setTrainingPrograms] = useState(initialPrograms);
  const [loading, setLoading] = useState<number | null>(null);

  // Calculate performance overview
  const performanceData = useMemo(() => {
    const totalAlerts = submissions.length;
    const resolved = Math.round(totalAlerts * 0.78); // Mock resolved data
    const closingRate = totalAlerts > 0 ? Math.round((resolved / totalAlerts) * 100) : 0;

    // Calculate top objections
    const objectionCounts: Record<number, number> = {};
    submissions.forEach(submission => {
      submission.choices.forEach(choiceId => {
        objectionCounts[choiceId] = (objectionCounts[choiceId] || 0) + 1;
      });
    });

    const topObjections = choices
      .map(choice => ({
        description: choice.description,
        count: objectionCounts[choice.id] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalAlerts,
      resolved,
      closingRate,
      topObjections
    };
  }, [submissions, choices]);

  // Sort training programs by completion, then priority and creation date
  const sortedPrograms = useMemo(() => {
    return [...trainingPrograms].sort((a, b) => {
      // Incomplete items first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then by priority
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      // Finally by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [trainingPrograms]);

  const toggleCompletion = async (programId: number) => {
    const program = trainingPrograms.find(p => p.id === programId);
    if (!program || loading === programId) return;

    setLoading(programId);

    try {
      const formData = new FormData();
      formData.append("programId", programId.toString());
      formData.append("completed", (!program.completed).toString());

      const result = await toggleTrainingCompletionAction(formData);
      
      if (result.success) {
        // Update local state with the new completion status
        setTrainingPrograms(prev => 
          prev.map(p => 
            p.id === programId 
              ? { ...p, completed: !p.completed, updated_at: new Date().toISOString() }
              : p
          )
        );
      } else {
        console.error("Failed to toggle completion:", result.error);
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
    } finally {
      setLoading(null);
    }
  };

  const formatEstimatedTime = (minutes?: number) => {
    if (!minutes) return "Ongoing";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <div className="flex-1 w-full flex flex-col p-8">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">My Training Plan</h1>
          <p className="text-muted-foreground">
            Personalized training materials to improve your sales performance
          </p>
        </div>

        {/* Performance Overview */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-5 w-5" />
            <div>
              <h2 className="text-xl font-semibold">Your Performance Overview</h2>
              <p className="text-muted-foreground">Current metrics and areas of focus</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{performanceData.totalAlerts}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{performanceData.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{performanceData.closingRate}%</p>
              <p className="text-sm text-muted-foreground">Closing Rate</p>
            </div>
          </div>

          {performanceData.topObjections.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Your Top Objections to Focus On:</h3>
              <div className="flex flex-wrap gap-2">
                {performanceData.topObjections.map((objection, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {objection.description} ({objection.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Training Progress */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-5 w-5" />
            <div>
              <h2 className="text-xl font-semibold">Training Progress</h2>
              <p className="text-muted-foreground">
                Track your completion of assigned training materials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-2xl font-bold text-green-700">
                {trainingPrograms.filter(p => p.completed).length}
              </p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">
                {trainingPrograms.filter(p => !p.completed).length}
              </p>
              <p className="text-sm text-yellow-600">In Progress</p>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{trainingPrograms.length}</p>
              <p className="text-sm text-blue-600">Total Items</p>
            </div>
          </div>
        </div>

        {/* Training Items */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5" />
            <div>
              <h2 className="text-xl font-semibold">Training Items</h2>
              <p className="text-muted-foreground">
                {trainingPrograms.length} item{trainingPrograms.length !== 1 ? 's' : ''} in your personalized training plan
              </p>
            </div>
          </div>

          {trainingPrograms.length > 0 ? (
            <div className="space-y-4">
              {sortedPrograms.map((program) => {
                const Icon = typeIcons[program.type as keyof typeof typeIcons];
                const isCompleted = program.completed;
                const isLoading = loading === program.id;
                
                return (
                  <div 
                    key={program.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-card border-border hover:border-muted-foreground/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => toggleCompletion(program.id)}
                          disabled={isLoading}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-muted-foreground/30 hover:border-green-500'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {isCompleted && <CheckCircle className="h-4 w-4" />}
                        </button>
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`text-lg font-semibold ${
                            isCompleted ? 'text-green-700' : ''
                          }`}>
                            {program.title}
                            {isCompleted && (
                              <span className="ml-2 text-sm text-green-600 font-normal">
                                Completed {new Date(program.updated_at).toLocaleDateString()}
                              </span>
                            )}
                          </h3>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {program.description || 'Complete this training to improve your skills'}
                        </p>
                        
                        <p className="text-sm text-blue-600 hover:underline mb-3">
                          <span className="font-medium">Content:</span>{' '}
                          <a href={program.link} target="_blank" rel="noopener noreferrer">
                            {program.link}
                          </a>
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            priorityColors[program.priority as keyof typeof priorityColors]
                          }`}>
                            {program.priority} priority
                          </span>
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatEstimatedTime(program.estimated_time_minutes)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Training Items Yet</h3>
              <p className="text-muted-foreground">
                Your manager will assign personalized training materials based on your performance and areas for improvement.
              </p>
            </div>
          )}
        </div>

        {/* Motivational Section */}
        {trainingPrograms.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Keep Up the Great Work!</h3>
            </div>
            <p className="text-blue-800 mb-4">
              Completing your training items will help you handle objections more effectively and close more deals. 
              Each completed item brings you closer to becoming a top performer.
            </p>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${trainingPrograms.length > 0 ? (trainingPrograms.filter(p => p.completed).length / trainingPrograms.length) * 100 : 0}%` 
                }}
              />
            </div>
            <p className="text-sm text-blue-700 mt-2">
              {trainingPrograms.filter(p => p.completed).length} of {trainingPrograms.length} items completed ({Math.round((trainingPrograms.filter(p => p.completed).length / trainingPrograms.length) * 100) || 0}%)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}