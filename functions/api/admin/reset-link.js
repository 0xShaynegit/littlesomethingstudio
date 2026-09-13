// POST /api/admin/reset-link
// Body: { user_id }
// Admin only. Creates a one-time password reset token (valid 24 hours) and
// returns the full URL for the admin to send the facilitator directly
// (LINE, WhatsApp, etc), since email sending isn't wired up yet.

import { getSessionUser } from '../_auth-helper.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const admin = await getSessionUser(context);

  if (!admin) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (admin.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { user_id } = await request.json();
  if (!user_id) {
    return Response.json({ error: 'user_id is required' }, { status: 400 });
  }

  const targetUser = await env.DB
    .prepare('SELECT id FROM users WHERE id = ?')
    .bind(user_id)
    .first();
  if (!targetUser) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await env.DB
    .prepare('INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, user_id, expiresAt)
    .run();

  const url = new URL(request.url);
  const resetUrl = `${url.origin}/reset-password.html?token=${token}`;

  return Response.json({ success: true, reset_url: resetUrl, expires_at: expiresAt });
}
