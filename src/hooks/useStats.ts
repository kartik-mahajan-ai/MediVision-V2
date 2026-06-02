import { useState, useEffect } from 'react';
import { statsAPI } from '@/lib/api';

interface Stats {
    profiles: number;
    xray_analyses: number;
    symptom_checks: number;
}

// Utility function to format large numbers
export const formatStatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

export const useStats = () => {
    const [stats, setStats] = useState<Stats>({
        profiles: 0,
        xray_analyses: 0,
        symptom_checks: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statsAPI.getGlobal();
                setStats(data);
                setError(null);
            } catch (err) {
                // If API is not available, use placeholder values
                console.error('Stats fetch error:', err);
                setStats({
                    profiles: 1000,
                    xray_analyses: 2500,
                    symptom_checks: 1800,
                });
                setError('Using placeholder data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};
