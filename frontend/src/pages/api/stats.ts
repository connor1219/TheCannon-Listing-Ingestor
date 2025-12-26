import { NextApiRequest, NextApiResponse } from 'next';

interface SubscribersResponse {
  totalSubscribers: number;
}

interface NotificationsResponse {
  totalNotificationsSent: number;
}

type StatsResponse = SubscribersResponse | NotificationsResponse;

export default async function handler(req: NextApiRequest, res: NextApiResponse<StatsResponse | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  if (type !== 'subscribers' && type !== 'notifications') {
    return res.status(400).json({ error: 'Invalid type parameter. Use "subscribers" or "notifications"' });
  }

  try {
    const firebaseUrl = process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:5001/thecannonmonitor/us-central1/get_stats'
      : 'https://us-central1-thecannonmonitor.cloudfunctions.net/get_stats';

    const response = await fetch(firebaseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Firebase function returned ${response.status}`);
    }

    const data = await response.json();
    
    if (type === 'subscribers') {
      res.status(200).json({
        totalSubscribers: data.total_subscribers || 0,
      });
    } else {
      res.status(200).json({
        totalNotificationsSent: data.total_notifications_sent || 0,
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
