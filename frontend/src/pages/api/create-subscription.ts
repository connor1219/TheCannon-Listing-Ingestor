import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const firebaseResponse = await fetch(
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:5001/thecannonmonitor/us-central1/create_subscription'
        : 'https://us-central1-thecannonmonitor.cloudfunctions.net/create_subscription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await firebaseResponse.json();

    if (!firebaseResponse.ok) {
      return res.status(firebaseResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
