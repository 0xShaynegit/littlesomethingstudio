// POST /api/auth/login
// Body: { email, password }
// Sets an httpOnly session cookie on success

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionId() {
  return crypto.randomUUID();
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await env.DB
    .prepare('SELECT id, name, role, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (!user || !user.password_hash) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const hashedInput = await hashPassword(password);
  if (hashedInput !== user.password_hash) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  await env.DB
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, user.id, expiresAt)
    .run();

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set(
    'Set-Cookie',
    `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
  );

  return new Response(
    JSON.stringify({ success: true, user: { id: user.id, name: user.name, role: user.role } }),
    { status: 200, headers }
  );
}
