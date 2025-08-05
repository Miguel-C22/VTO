"use client";

import { useState } from "react";
import { ArrowLeft, Target, Plus, Video, FileText, Globe, Trophy, Clock, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserWithMetadata } from "@/lib/user-utils";
import { addTrainingProgramAction, deleteTrainingProgramAction, toggleTrainingCompletionAction } from "@/app/actions";

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

interface TrainingPlanManagerProps {
  associate: UserWithMetadata;
  submissions: Submission[];
  choices: Choice[];
  trainingPrograms: TrainingProgram[];
  dealershipId: string;
}

const typeIcons = {
  video: Video,
  document: FileText,
  article: Globe,
  performance_goal: Trophy
};

const priorityColors = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200", 
  high: "bg-red-50 text-red-700 border-red-200"
};

export function TrainingPlanManager({ 
  associate, 
  submissions, 
  choices, 
  trainingPrograms: initialPrograms, 
  dealershipId 
}: TrainingPlanManagerProps) {
  const [trainingPrograms, setTrainingPrograms] = useState(initialPrograms);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  // Calculate performance metrics
  const totalAlerts = submissions.length;
  const resolved = Math.round(totalAlerts * 0.78); // Mock resolved data
  const closingRate = Math.round(totalAlerts > 0 ? (resolved / totalAlerts) * 100 : 0);

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
    .slice(0, 3)
    .map(obj => obj.description);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    link: "",
    description: "",
    priority: "medium",
    estimated_time_minutes: ""
  });

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("associate_id", associate.id);
    formDataObj.append("dealership_id", dealershipId);
    formDataObj.append("title", formData.title);
    formDataObj.append("type", formData.type);
    formDataObj.append("link", formData.link);
    formDataObj.append("description", formData.description);
    formDataObj.append("priority", formData.priority);
    if (formData.estimated_time_minutes) {
      formDataObj.append("estimated_time_minutes", formData.estimated_time_minutes);
    }

    try {
      const result = await addTrainingProgramAction(formDataObj);
      if (result.success && result.data) {
        setTrainingPrograms(prev => [result.data!, ...prev]);
        setFormData({
          title: "",
          type: "video", 
          link: "",
          description: "",
          priority: "medium",
          estimated_time_minutes: ""
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding training program:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTraining = async (programId: number) => {
    if (!confirm("Are you sure you want to delete this training item?")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("programId", programId.toString());
      
      const result = await deleteTrainingProgramAction(formData);
      if (result.success) {
        setTrainingPrograms(prev => prev.filter(p => p.id !== programId));
      }
    } catch (error) {
      console.error("Error deleting training program:", error);
    }
  };

  const toggleCompletion = async (programId: number) => {
    const program = trainingPrograms.find(p => p.id === programId);
    if (!program || toggleLoading === programId) return;

    setToggleLoading(programId);

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
      setToggleLoading(null);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col p-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href="/reports" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Training Plan</h1>
            <p className="text-muted-foreground">
              Create a personalized training plan for {associate.full_name}
            </p>
          </div>
        </div>

        {/* Associate Performance Overview */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Associate Performance Overview</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Performance */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Performance</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalAlerts}</p>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{closingRate}%</p>
                  <p className="text-sm text-muted-foreground">Closing Rate</p>
                </div>
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Areas for Improvement</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Top Objections:</h4>
                  <div className="flex flex-wrap gap-2">
                    {topObjections.slice(0, 3).map((objection, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-muted rounded-full text-sm"
                      >
                        {objection}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Weak Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Closing techniques</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Objection handling</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Product knowledge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Training Item */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5" />
              <div>
                <h2 className="text-xl font-semibold">Add Training Item</h2>
                <p className="text-muted-foreground">
                  Add videos, documents, or goals to help improve performance
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
            >
              {showAddForm ? "Cancel" : "Add Item"}
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTraining} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Handling Price Objections"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Training</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="performance_goal">Performance Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">
                    {formData.type === 'video' ? 'Video URL *' : 
                     formData.type === 'document' ? 'Document URL *' :
                     formData.type === 'article' ? 'Article URL *' : 'Reference URL *'}
                  </Label>
                  <Input
                    id="link"
                    placeholder={
                      formData.type === 'video' ? 'https://youtube.com/watch?v=...' :
                      formData.type === 'document' ? 'https://docs.google.com/...' :
                      'https://...'
                    }
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Estimated Time</Label>
                  <Input
                    id="estimated_time"
                    placeholder="e.g., 15 min, 1 hour"
                    value={formData.estimated_time_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_time_minutes: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Brief description of this training item"
                  className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || !formData.title || !formData.link}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Adding..." : "Add Training Item"}
              </Button>
            </form>
          )}
        </div>

        {/* Current Training Plan */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-5 w-5" />
            <div>
              <h2 className="text-xl font-semibold">Current Training Plan</h2>
              <p className="text-muted-foreground">
                {trainingPrograms.length} training item{trainingPrograms.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>

          {trainingPrograms.length > 0 ? (
            <div className="space-y-4">
              {trainingPrograms.map((program) => {
                const Icon = typeIcons[program.type as keyof typeof typeIcons];
                const isCompleted = program.completed;
                const isToggleLoading = toggleLoading === program.id;
                
                return (
                  <div 
                    key={program.id} 
                    className={`border rounded-lg p-4 ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            onClick={() => toggleCompletion(program.id)}
                            disabled={isToggleLoading}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-muted-foreground/30 hover:border-green-500'
                            } ${isToggleLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {isCompleted && <CheckCircle className="h-3 w-3" />}
                          </button>
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            isCompleted ? 'text-green-700' : ''
                          }`}>
                            {program.title}
                            {isCompleted && (
                              <span className="ml-2 text-sm text-green-600 font-normal">
                                ✓ Completed {new Date(program.updated_at).toLocaleDateString()}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {program.description}
                          </p>
                          <p className="text-sm text-blue-600 hover:underline">
                            Content: <a href={program.link} target="_blank" rel="noopener noreferrer">
                              {program.link}
                            </a>
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[program.priority as keyof typeof priorityColors]}`}>
                              {program.priority} priority
                            </span>
                            {program.estimated_time_minutes && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {program.estimated_time_minutes} min
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTraining(program.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Training Items Yet</h3>
              <p className="text-muted-foreground">
                Add training videos, documents, or goals to help {associate.full_name} improve their performance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}