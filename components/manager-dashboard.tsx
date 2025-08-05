"use client";

import { useMemo } from "react";
import { 
  Bell, 
  Users, 
  BarChart3, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  Building,
  Settings,
  Activity,
  FileText,
  Target,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserWithMetadata } from "@/lib/user-utils";

interface Submission {
  id: number;
  associate_id: string;
  choices: number[];
  comment?: string;
  created_at: string;
  resolved: boolean;
  notified_manager_ids: string[];
}

interface Choice {
  id: number;
  description: string;
}

interface TeamMember {
  id: string;
  role: string;
  created_at: string;
}

interface TrainingProgram {
  id: number;
  associate_id: string;
  completed: boolean;
  priority: string;
  created_at: string;
}

interface ActiveAlert {
  id: number;
  associate_id: string;
  created_at: string;
}

interface ResetConfig {
  reset_type: string;
  reset_time: string;
  last_reset: string;
}

interface Dealership {
  name: string;
  city: string;
  state: string;
}

interface ManagerDashboardProps {
  dealership: Dealership | null;
  submissions: Submission[];
  choices: Choice[];
  team: TeamMember[];
  teamWithMetadata: UserWithMetadata[];
  trainingPrograms: TrainingProgram[];
  resetConfig: ResetConfig | null;
  activeAlerts: ActiveAlert[];
  currentManagerId: string;
}

export function ManagerDashboard({
  dealership,
  submissions,
  choices,
  team,
  teamWithMetadata,
  trainingPrograms,
  resetConfig,
  activeAlerts,
  currentManagerId
}: ManagerDashboardProps) {
  
  const dashboardData = useMemo(() => {
    // Calculate key metrics
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Team metrics
    const associates = team.filter(t => t.role === 'associate');
    const managers = team.filter(t => t.role === 'manager');

    // Submission metrics
    const totalSubmissions = submissions.length;
    const resolvedSubmissions = submissions.filter(s => s.resolved).length;
    const weeklySubmissions = submissions.filter(s => new Date(s.created_at) >= last7Days).length;
    const monthlySubmissions = submissions.filter(s => new Date(s.created_at) >= last30Days).length;
    
    // Resolution metrics
    const resolutionRate = totalSubmissions > 0 ? Math.round((resolvedSubmissions / totalSubmissions) * 100) : 0;
    
    // Top objections
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
      .slice(0, 5);

    // Training metrics
    const totalTrainingItems = trainingPrograms.length;
    const completedTraining = trainingPrograms.filter(t => t.completed).length;
    const trainingCompletionRate = totalTrainingItems > 0 ? Math.round((completedTraining / totalTrainingItems) * 100) : 0;
    
    // High priority training items
    const highPriorityTraining = trainingPrograms.filter(t => t.priority === 'high' && !t.completed).length;

    // Recent activity (last 7 days)
    const recentSubmissions = submissions
      .filter(s => new Date(s.created_at) >= last7Days)
      .slice(0, 5);

    // Team performance
    const teamPerformance = associates.map(associate => {
      const associateSubmissions = submissions.filter(s => s.associate_id === associate.id);
      const user = teamWithMetadata.find(u => u.id === associate.id);
      return {
        id: associate.id,
        name: user?.full_name || `Associate ${associate.id.slice(-8)}`,
        submissions: associateSubmissions.length,
        resolved: associateSubmissions.filter(s => s.resolved).length
      };
    }).sort((a, b) => b.submissions - a.submissions);

    return {
      totalSubmissions,
      resolvedSubmissions,
      weeklySubmissions,
      monthlySubmissions,
      resolutionRate,
      topObjections,
      associates: associates.length,
      managers: managers.length,
      totalTrainingItems,
      completedTraining,
      trainingCompletionRate,
      highPriorityTraining,
      recentSubmissions,
      teamPerformance: teamPerformance.slice(0, 5)
    };
  }, [submissions, choices, team, teamWithMetadata, trainingPrograms]);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getUserName = (userId: string) => {
    const user = teamWithMetadata.find(u => u.id === userId);
    return user?.full_name || `User ${userId.slice(-8)}`;
  };

  return (
    <div className="flex-1 w-full flex flex-col p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{dealership?.name}</span>
              <span>•</span>
              <span>{dealership?.city}, {dealership?.state}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <a href="/alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alerts ({activeAlerts.length})
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Alerts */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Active Alerts</h3>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-red-600">{activeAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Need attention</p>
            </div>
          </div>

          {/* Weekly Submissions */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{dashboardData.weeklySubmissions}</p>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Submissions</span>
              </div>
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Resolution Rate</h3>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{dashboardData.resolutionRate}%</p>
              <p className="text-sm text-muted-foreground">
                {dashboardData.resolvedSubmissions} of {dashboardData.totalSubmissions}
              </p>
            </div>
          </div>

          {/* Team Size */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{dashboardData.associates}</p>
              <p className="text-sm text-muted-foreground">Sales associates</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Submissions */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Button variant="outline" size="sm" asChild>
                  <a href="/reports">View All</a>
                </Button>
              </div>
              
              {dashboardData.recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          submission.resolved ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">{getUserName(submission.associate_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.choices.length} objection{submission.choices.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{getTimeAgo(submission.created_at)}</p>
                        <p className={`text-xs ${
                          submission.resolved ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.resolved ? 'Resolved' : 'Active'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>

            {/* Top Objections */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Top Objections</h3>
                <Button variant="outline" size="sm" asChild>
                  <a href="/reports">View Analysis</a>
                </Button>
              </div>
              
              {dashboardData.topObjections.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topObjections.map((objection, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{objection.description}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-foreground rounded-full h-2"
                            style={{ 
                              width: `${dashboardData.topObjections[0] ? (objection.count / dashboardData.topObjections[0].count) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{objection.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No objection data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/alerts">
                    <Bell className="h-4 w-4 mr-2" />
                    View Alerts ({activeAlerts.length})
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/reports">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/settings/users">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/settings/objections">
                    <Target className="h-4 w-4 mr-2" />
                    Manage Objections
                  </a>
                </Button>
              </div>
            </div>

            {/* Training Overview */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Training Overview</h3>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">{dashboardData.trainingCompletionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${dashboardData.trainingCompletionRate}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {dashboardData.completedTraining} of {dashboardData.totalTrainingItems} items completed
                </div>
                
                {dashboardData.highPriorityTraining > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        {dashboardData.highPriorityTraining} high priority items pending
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              {dashboardData.teamPerformance.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.teamPerformance.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-medium">{performer.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{performer.submissions}</span>
                        <span className="text-xs text-muted-foreground ml-1">alerts</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No team data yet</p>
                </div>
              )}
            </div>

            {/* System Status */}
            {resetConfig && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reset Schedule</span>
                    <span className="text-sm font-medium capitalize">{resetConfig.reset_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Reset</span>
                    <span className="text-sm font-medium">
                      {new Date(resetConfig.last_reset).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/settings/data">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}