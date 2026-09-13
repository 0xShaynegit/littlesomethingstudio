// GET /api/my-listings
// Returns listings belonging to the logged-in facilitator, any status

import { getSessionUser } from '../_auth-helper.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { results } = await env.DB
    .prepare('SELECT * FROM listings WHERE facilitator_id = ? ORDER BY start_time ASC')
    .bind(user.id)
    .all();

  return Response.json({ listings: results });
}
