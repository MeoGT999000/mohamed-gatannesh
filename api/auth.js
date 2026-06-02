// Vercel serverless function -- admin authentication
// Deploy alongside portfolio.html on Vercel

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const SUPABASE_URL = 'https://iigjumekpxlfzbaidiwl.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  // Critical: these must be set in Vercel environment variables
  if (!SUPABASE_ANON_KEY || !ADMIN_EMAIL) {
    console.error('Server misconfigured: missing env vars');
    return res.status(500).json({ error: 'Server error' });
  }

  try {
    const loginRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: password,
        }),
      }
    );

    const data = await loginRes.json();

    if (!loginRes.ok || !data.access_token) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return only what the client needs
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });

  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
