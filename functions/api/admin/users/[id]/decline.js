// POST /api/admin/users/[id]/decline
// Admin only. Declines a pending facilitator signup and deletes the account.

import { getSessionUser } from '../../../_auth-helper.js';

export async function onRequestPost(context) {
  const { env, params } = context;
  const admin = await getSessionUser(context);

  if (!admin) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (admin.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const targetUser = await env.DB
    .prepare('SELECT id, status, photo_key FROM users WHERE id = ?')
    .bind(params.id)
    .first();
  if (!targetUser) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  if (targetUser.status !== 'pending') {
    return Response.json({ error: 'User is not pending approval' }, { status: 400 });
  }

  if (targetUser.photo_key) {
    await env.PHOTOS.delete(targetUser.photo_key);
  }
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(params.id).run();

  return Response.json({ success: true });
}
