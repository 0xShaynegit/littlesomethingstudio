// POST /api/admin/users/[id]/approve
// Admin only. Approves a pending facilitator so they can log in and appear
// on facilitators.html.

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
    .prepare('SELECT id, status FROM users WHERE id = ?')
    .bind(params.id)
    .first();
  if (!targetUser) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  if (targetUser.status !== 'pending') {
    return Response.json({ error: 'User is not pending approval' }, { status: 400 });
  }

  await env.DB
    .prepare("UPDATE users SET status = 'approved' WHERE id = ?")
    .bind(params.id)
    .run();

  return Response.json({ success: true });
}
