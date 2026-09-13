// GET /api/admin/calendar
// Admin only. Returns approved listings grouped by date for a simple week/room availability view.

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
    .prepare(`
      SELECT listings.id, listings.title_en, listings.start_time, listings.end_time, listings.status,
             users.name AS facilitator_name
      FROM listings
      JOIN users ON listings.facilitator_id = users.id
      WHERE listings.status IN ('approved', 'pending')
      ORDER BY listings.start_time ASC
    `)
    .all();

  // group by date (YYYY-MM-DD) so the frontend can render a simple day strip
  const byDate = {};
  for (const row of results) {
    const date = row.start_time.split(' ')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(row);
  }

  return Response.json({ calendar: byDate });
}
