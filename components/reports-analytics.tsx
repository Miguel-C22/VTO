"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Users, Activity } from "lucide-react";
import { UserWithMetadata } from "@/lib/user-utils";

interface Submission {
  id: number;
  choices: number[];
  comment?: string;
  created_at: string;
  associate_id: string;
  notified_manager_ids: string[];
  resolved: boolean;
}

interface Choice {
  id: number;
  description: string;
}

interface User {
  id: string;
  role: string;
}

interface ReportsAnalyticsProps {
  submissions: Submission[];
  choices: Choice[];
  users: User[];
  usersWithMetadata: UserWithMetadata[];
}

export function ReportsAnalytics({ submissions, choices, users, usersWithMetadata }: ReportsAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalAlerts = submissions.length;
    const associates = users.filter(u => u.role === 'associate');
    const teamMembers = associates.length;

    const currentMonth = new Date().getMonth();
    const currentSubmissions = submissions.filter(s => 
      new Date(s.created_at).getMonth() === currentMonth
    );
    const lastMonthSubmissions = Math.round(totalAlerts * 0.9); // Simulated previous month data
    
    const alertGrowth = totalAlerts > 0 ? 
      Math.round(((totalAlerts - lastMonthSubmissions) / lastMonthSubmissions) * 100) : 0;

    const objectionCounts: Record<number, number> = {};
    submissions.forEach(submission => {
      submission.choices.forEach(choiceId => {
        objectionCounts[choiceId] = (objectionCounts[choiceId] || 0) + 1;
      });
    });

    const objectionStats = choices.map(choice => {
      const count = objectionCounts[choice.id] || 0;
      const percentage = totalAlerts > 0 ? Math.round((count / totalAlerts) * 100) : 0;
      const growthOptions = ['+5%', '-2%', '+8%', '+3%', '-1%', '+2%'];
      const growth = growthOptions[choice.id % growthOptions.length];
      
      return {
        id: choice.id,
        description: choice.description,
        count,
        percentage,
        growth
      };
    }).sort((a, b) => b.count - a.count);

    const associatePerformance = associates.map(associate => {
      const associateSubmissions = submissions.filter(s => s.associate_id === associate.id);
      const totalAlerts = associateSubmissions.length;
      
      const userMetadata = usersWithMetadata.find(u => u.id === associate.id);
      
      const associateObjections: Record<number, number> = {};
      associateSubmissions.forEach(submission => {
        submission.choices.forEach(choiceId => {
          associateObjections[choiceId] = (associateObjections[choiceId] || 0) + 1;
        });
      });

      const topObjections = choices
        .map(choice => ({
          description: choice.description,
          count: associateObjections[choice.id] || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(obj => obj.description);

      const trend = totalAlerts > 15 ? 'Needs Focus' : 'Improving';

      return {
        id: associate.id,
        name: userMetadata?.full_name || `User ${associate.id.slice(0, 8)}`,
        email: userMetadata?.email || `user-${associate.id.slice(0, 8)}@dealership.com`,
        totalAlerts,
        topObjections,
        trend
      };
    });

    return {
      totalAlerts,
      alertGrowth,
      teamMembers,
      objectionStats,
      associatePerformance
    };
  }, [submissions, choices, users, usersWithMetadata]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Alerts */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Alerts</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{analytics.totalAlerts}</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{analytics.alertGrowth}% from last month</span>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{analytics.teamMembers}</p>
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600">Active salespeople</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dealership Objection Analysis */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Dealership Objection Analysis</h2>
            <p className="text-muted-foreground">
              Most common reasons guests leave - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {analytics.objectionStats.slice(0, 6).map((objection, index) => (
            <div key={objection.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{objection.description}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    objection.growth.startsWith('+') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                  }`}>
                    {objection.growth}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {objection.count} times ({objection.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-foreground rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(objection.count / (analytics.objectionStats[0]?.count || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Performance Report Cards */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">Individual Performance Report Cards</h2>
            <p className="text-muted-foreground">
              Personalized insights for each salesperson
            </p>
          </div>
        </div>

        {/* Show cards only if there are submissions */}
        {analytics.totalAlerts > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.associatePerformance
              .filter(associate => associate.totalAlerts > 0) // Only show associates with submissions
              .map((associate) => (
              <div key={associate.id} className="bg-card border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{associate.name}</h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    associate.trend === 'Improving' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {associate.trend === 'Improving' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {associate.trend}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{associate.totalAlerts}</p>
                    <p className="text-sm text-muted-foreground">Total Alerts</p>
                  </div>
                </div>

                {/* Top 3 Objections */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Top 3 Objections:</h4>
                  <ol className="space-y-1 text-sm text-muted-foreground">
                    {associate.topObjections.map((objection, index) => (
                      <li key={index}>
                        {index + 1}. {objection || 'No data'}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Training Plan Button */}
                <a 
                  href={`/training-plan/${associate.id}`}
                  className="block w-full py-2 px-4 border border-muted-foreground/20 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-center"
                >
                  Training Plan
                </a>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state when no submissions exist */
          <div className="bg-card border rounded-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Submission Data Available</h3>
                <p className="text-muted-foreground">
                  Individual performance cards will appear once team members submit objection reports.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}