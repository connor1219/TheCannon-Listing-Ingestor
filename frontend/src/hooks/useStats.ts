import { useState, useEffect } from 'react';

interface Stats {
  totalSubscribers: number;
  totalNotificationsSent: number;
}

interface UseStatsReturn {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make two separate requests in parallel
        const [subscribersResponse, notificationsResponse] = await Promise.all([
          fetch('/api/stats?type=subscribers'),
          fetch('/api/stats?type=notifications'),
        ]);
        
        if (!subscribersResponse.ok) {
          throw new Error(`Failed to fetch subscribers: ${subscribersResponse.status}`);
        }
        
        if (!notificationsResponse.ok) {
          throw new Error(`Failed to fetch notifications: ${notificationsResponse.status}`);
        }
        
        const subscribersData = await subscribersResponse.json();
        const notificationsData = await notificationsResponse.json();
        
        setStats({
          totalSubscribers: subscribersData.totalSubscribers,
          totalNotificationsSent: notificationsData.totalNotificationsSent,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        setStats({
          totalSubscribers: 0,
          totalNotificationsSent: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
