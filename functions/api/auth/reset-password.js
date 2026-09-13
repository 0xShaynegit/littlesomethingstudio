// POST /api/auth/reset-password
// Body: { token, password }
// No login required, the token itself is the authorization.
// On success, invalidates every existing session for that user (a leaked
// old session shouldn't survive a password reset).

import { hashPassword, passwordError } from '../_password.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const { token, password } = await request.json();

  if (!token || !password) {
    return Response.json({ error: 'token and password are required' }, { status: 400 });
  }

  const err = passwordError(password);
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }

  const row = await env.DB
    .prepare('SELECT token, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?')
    .bind(token)
    .first();

  if (!row) {
    return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 });
  }
  if (row.used) {
    return Response.json({ error: 'This reset link has already been used' }, { status: 400 });
  }
  if (new Date(row.expires_at) < new Date()) {
    return Response.json({ error: 'This reset link has expired' }, { status: 400 });
  }

  const newHash = await hashPassword(password);

  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, row.user_id),
    env.DB.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').bind(token),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id)
  ]);

  return Response.json({ success: true });
}
