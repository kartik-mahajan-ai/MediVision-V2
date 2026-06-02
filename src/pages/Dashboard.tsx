import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { xrayAPI, symptomsAPI } from '@/lib/api';
import { DashboardSkeleton } from '@/components/ui/page-skeletons';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { HealthScoreWidget } from '@/components/dashboard/HealthScoreWidget';
import { format, formatDistanceToNow } from 'date-fns';
import { useOnboarding } from '@/hooks/useOnboarding';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  FileImage,
  Stethoscope,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle,
  Activity,
  Calendar,
  AlertCircle,
  Info,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';

interface AnalysisSummary {
  totalXRays: number;
  totalSymptomChecks: number;
  lastAnalysisDate: string | null;
  recentActivity: Array<{
    type: 'xray' | 'symptom';
    date: string;
    result: string;
  }>;
}

import { HealthPulse } from '@/components/dashboard/HealthPulse';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalysisSummary>({
    totalXRays: 0,
    totalSymptomChecks: 0,
    lastAnalysisDate: null,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Determine health status for pulse widget
  const getHealthStatus = (): 'normal' | 'warning' | 'critical' | 'idle' => {
    if (summary.recentActivity.length === 0) return 'idle';
    const latest = summary.recentActivity[0];
    
    if (latest.type === 'xray') {
      if (latest.result === 'normal') return 'normal';
      if (latest.result === 'covid19' || latest.result === 'pneumonia') return 'critical';
      return 'warning';
    } else {
      if (latest.result === 'low') return 'normal';
      if (latest.result === 'critical' || latest.result === 'high') return 'critical';
      return 'warning';
    }
  };

  // Safely get user display name
  const getUserDisplayName = () => {
    if (!user) return '';

    // Try full_name from metadata
    if (user.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string') {
      return user.user_metadata.full_name;
    }

    // Try email and extract name part
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return '';
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;

      try {
        const { count: xrayCount } = await xrayAPI.getCount();
        const { count: symptomCount } = await symptomsAPI.getCount();
        const recentXRays = await xrayAPI.getRecent(3);
        const recentSymptoms = await symptomsAPI.getRecent(3);

        const recentActivity: AnalysisSummary['recentActivity'] = [
          ...(recentXRays?.map((x) => ({
            type: 'xray' as const,
            date: x.created_at,
            result: x.prediction,
          })) || []),
          ...(recentSymptoms?.map((s) => ({
            type: 'symptom' as const,
            date: s.created_at,
            result: s.risk_level || 'completed',
          })) || []),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        // Get last analysis date
        const lastDate = recentActivity.length > 0 ? recentActivity[0].date : null;

        setSummary({
          totalXRays: xrayCount || 0,
          totalSymptomChecks: symptomCount || 0,
          lastAnalysisDate: lastDate,
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    // Poll for updates every 10 seconds
    const intervalId = setInterval(fetchSummary, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  const getResultBadge = (type: string, result: string) => {
    if (type === 'xray') {
      const classes: Record<string, string> = {
        normal: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        covid19: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        pneumonia: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        lung_opacity: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      };
      return classes[result] || 'bg-muted text-muted-foreground';
    }
    const classes: Record<string, string> = {
      low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      moderate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      high: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      critical: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return classes[result] || 'bg-muted text-muted-foreground';
  };

  const formatResult = (result: string) => {
    return result.replace('_', ' ').charAt(0).toUpperCase() + result.replace('_', ' ').slice(1);
  };

  const displayName = getUserDisplayName();
  const { startOnboarding, hasCompletedOnboarding, isOnboardingActive } = useOnboarding();

  useEffect(() => {
    if (!hasCompletedOnboarding && !isOnboardingActive) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, isOnboardingActive, startOnboarding]);

  const totalAnalyses = summary.totalXRays + summary.totalSymptomChecks;
  const avgConfidence = 85;

  // Show skeleton while loading
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <OnboardingTour />
        
        {/* Header Section - Premiere Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-premium rounded-3xl p-8 mb-8 relative"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <HealthPulse status={getHealthStatus()} />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {displayName.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Your diagnostic engine is primed and ready.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => window.location.href = '/xray-analysis'} className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                New Analysis
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Health Score Widget - New Addition */}
        <HealthScoreWidget
          totalAnalyses={summary.totalXRays + summary.totalSymptomChecks}
          recentActivityCount={summary.recentActivity.length}
          lastAnalysisDate={summary.lastAnalysisDate}
        />

        {/* Stats - Compact Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Analyses', value: totalAnalyses, icon: Activity, color: 'text-blue-500' },
            { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Zap, color: 'text-amber-500' },
            { label: 'Health Score', value: 'Optimal', icon: Shield, color: 'text-emerald-500' },
            { label: 'Scan Credits', value: 'Unlimited', icon: Sparkles, color: 'text-purple-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass-premium rounded-2xl p-6 group hover:scale-[1.02] transition-all"
            >
              <stat.icon className={cn("h-6 w-6 mb-4", stat.color)} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Service Showcase - Premium Quick Actions */}
        <div className="py-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            AI Training Services
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <Link to="/xray-analysis" className="group">
              <div className="liquid-glass-card hover:scale-[1.02] hover:border-blue-500/40 cursor-pointer">
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                  <FileImage className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">X-Ray Analysis</h3>
                <p className="text-xs text-muted-foreground px-2">
                  Clinical-grade AI diagnostics with real-time heatmap visualization.
                </p>
                <div className="mt-6 flex items-center text-blue-500 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                  Launch <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>

            <Link to="/symptom-checker" className="group">
              <div className="liquid-glass-card hover:scale-[1.02] hover:border-purple-500/40 cursor-pointer">
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-purple-500/20">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Symptom AI</h3>
                <p className="text-xs text-muted-foreground px-2">
                  Advanced neural risk assessment based on clinical patterns.
                </p>
                <div className="mt-6 flex items-center text-purple-500 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                  Check <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>

            <Link to="/chat" className="group">
              <div className="liquid-glass-card hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer">
                <div className="mb-6 p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI Assistant</h3>
                <p className="text-xs text-muted-foreground px-2">
                  Expert medical insights and educational context-aware chat.
                </p>
                <div className="mt-6 flex items-center text-emerald-500 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                  Chat <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity & Tips - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.recentActivity.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mb-1">No activity yet</p>
                  <Button variant="link" asChild className="text-primary p-0 h-auto text-sm">
                    <Link to="/xray-analysis">Start your first analysis</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recentActivity.map((activity, index) => (
                    <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.type === 'xray' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                          }`}>
                          {activity.type === 'xray' ? (
                            <FileImage className="h-4 w-4" />
                          ) : (
                            <Stethoscope className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.type === 'xray' ? 'X-Ray Analysis' : 'Symptom Check'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getResultBadge(activity.type, activity.result)}`}>
                        {formatResult(activity.result)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Verify AI predictions with clinical findings",
                  "Use high-quality images for best results",
                  "Consider differential diagnoses",
                  "Review past analyses regularly"
                ].map((tip, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Disclaimer - Compact */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Educational Only:</strong> Always consult healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
