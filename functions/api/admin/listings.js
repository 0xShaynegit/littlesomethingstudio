// GET /api/admin/listings
// Admin only. Returns all listings across all facilitators, any status.

import { getSessionUser } from '../../_auth-helper.js';

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
    .prepare(`
      SELECT listings.*, users.name AS facilitator_name
      FROM listings
      JOIN users ON listings.facilitator_id = users.id
      ORDER BY listings.status ASC, listings.start_time ASC
    `)
    .all();

  return Response.json({ listings: results });
}
