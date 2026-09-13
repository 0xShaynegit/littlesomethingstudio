// Shared helper: verifies a session cookie against the sessions table
// Import into any protected function: import { getSessionUser } from '../_auth-helper.js'

export async function getSessionUser(context) {
  const { env, request } = context;
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);

  if (!match) {
    return null;
  }

  const sessionId = match[1];

  const session = await env.DB
    .prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?')
    .bind(sessionId)
    .first();

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at) < new Date()) {
    // expired, clean it up
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    return null;
  }

  const user = await env.DB
    .prepare('SELECT id, name, email, role FROM users WHERE id = ?')
    .bind(session.user_id)
    .first();

  return user || null;
}
