import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    const firebaseUrl = process.env.NODE_ENV === 'development'
      ? `http://127.0.0.1:5001/thecannonmonitor/us-central1/unsubscribe?id=${encodeURIComponent(id)}`
      : `https://us-central1-thecannonmonitor.cloudfunctions.net/unsubscribe?id=${encodeURIComponent(id)}`;

    const firebaseResponse = await fetch(firebaseUrl, {
      method: 'GET',
    });

    if (firebaseResponse.ok) {
      const contentType = firebaseResponse.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        res.status(200).json({ success: true, message: 'Successfully unsubscribed' });
      } else {
        const firebaseData = await firebaseResponse.json();
        res.status(200).json(firebaseData);
      }
    } else {
      const firebaseData = await firebaseResponse.json();
      res.status(firebaseResponse.status).json(firebaseData);
    }
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
