// GET /api/admin/users
// Admin only. Lists all users so the admin dashboard can offer reset links.

import { getSessionUser } from '../_auth-helper.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { results } = await env.DB
    .prepare('SELECT id, name, email, role, password_hash IS NOT NULL AS has_password FROM users ORDER BY role, name')
    .all();

  return Response.json({ users: results });
}
