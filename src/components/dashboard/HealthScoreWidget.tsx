import { useEffect, useState } from 'react';
import { Heart, TrendingUp, Sparkles } from 'lucide-react';

interface HealthScoreWidgetProps {
    totalAnalyses: number;
    recentActivityCount: number;
    lastAnalysisDate: string | null;
}

export function HealthScoreWidget({
    totalAnalyses,
    recentActivityCount,
    lastAnalysisDate
}: HealthScoreWidgetProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    // Calculate engagement score (0-100)
    const calculateScore = () => {
        let score = 0;
        // Base score for having analyses
        if (totalAnalyses > 0) score += 30;
        if (totalAnalyses >= 3) score += 20;
        if (totalAnalyses >= 5) score += 10;
        // Recent activity bonus
        if (recentActivityCount > 0) score += 20;
        if (recentActivityCount >= 3) score += 10;
        // Recent analysis bonus
        if (lastAnalysisDate) {
            const daysSince = Math.floor((Date.now() - new Date(lastAnalysisDate).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince <= 1) score += 10;
            else if (daysSince <= 7) score += 5;
        }
        return Math.min(score, 100);
    };

    const score = calculateScore();

    // Animate score on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 100);
        return () => clearTimeout(timer);
    }, [score]);

    // Get insight message based on score
    const getInsight = () => {
        if (score >= 80) return "Great job staying on top of your health!";
        if (score >= 60) return "You're making good progress with your health tracking.";
        if (score >= 40) return "Try analyzing more scans to boost your insights.";
        if (score >= 20) return "Start your health journey with an X-Ray analysis!";
        return "Welcome! Upload your first scan to get started.";
    };

    // Get color based on score
    const getScoreColor = () => {
        if (score >= 80) return { primary: '#22c55e', secondary: '#86efac' }; // green
        if (score >= 60) return { primary: '#3b82f6', secondary: '#93c5fd' }; // blue
        if (score >= 40) return { primary: '#f59e0b', secondary: '#fcd34d' }; // amber
        return { primary: '#6366f1', secondary: '#a5b4fc' }; // indigo
    };

    const colors = getScoreColor();
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

            <div className="relative z-10 flex items-center gap-6">
                {/* Circular Progress */}
                <div className="relative flex-shrink-0">
                    <svg width="120" height="120" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-muted/20"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke={colors.primary}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                transition: 'stroke-dashoffset 1s ease-out',
                                filter: `drop-shadow(0 0 6px ${colors.primary}40)`
                            }}
                        />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className="text-3xl font-bold"
                            style={{ color: colors.primary }}
                        >
                            {animatedScore}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
                    </div>
                </div>

                {/* Info section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5" style={{ color: colors.primary }} />
                        <h3 className="font-semibold text-lg">Health Engagement</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                        <span>{getInsight()}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {totalAnalyses} analyses
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active this week
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
