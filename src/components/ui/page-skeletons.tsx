import { Skeleton } from './skeleton';

// Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                        <Skeleton className="h-10 w-20 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-xl border border-border">
                            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity & Tips Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border border-border p-6">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-lg border border-border p-6">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// X-Ray Analysis Skeleton
export function XRayAnalysisSkeleton() {
    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-border rounded-xl p-12">
                <div className="flex flex-col items-center">
                    <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>

            {/* Recent Analyses */}
            <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border border-border overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4">
                                <Skeleton className="h-5 w-24 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Chat Skeleton
export function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full animate-in">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <Skeleton className="h-6 w-40" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4">
                {/* Assistant Message */}
                <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 max-w-[80%]">
                        <Skeleton className="h-20 w-full rounded-2xl rounded-bl-sm" />
                    </div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 justify-end">
                    <div className="max-w-[80%]">
                        <Skeleton className="h-12 w-48 rounded-2xl rounded-br-sm" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                </div>

                {/* Assistant Message */}
                <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 max-w-[80%]">
                        <Skeleton className="h-32 w-full rounded-2xl rounded-bl-sm" />
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <Skeleton className="h-12 flex-1 rounded-lg" />
                    <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// Symptom Checker Skeleton
export function SymptomCheckerSkeleton() {
    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-56 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Symptom Input Form */}
            <div className="rounded-xl border border-border p-6">
                <Skeleton className="h-5 w-32 mb-4" />

                {/* Symptom Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                </div>

                {/* Input */}
                <Skeleton className="h-12 w-full rounded-lg mb-4" />

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </div>

                {/* Submit Button */}
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Recent Checks */}
            <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="rounded-lg border border-border p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
