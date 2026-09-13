// GET /api/my-listings — returns the logged-in facilitator's own listings, any status
// POST /api/my-listings — facilitator creates a new listing, always starts as 'pending'

import { getSessionUser } from './_auth-helper.js';

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

export async function onRequestPost(context) {
  const { env, request } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (user.role !== 'facilitator') {
    return Response.json({ error: 'Only facilitators can create listings' }, { status: 403 });
  }

  const { title_en, category, start_time, end_time, price, capacity } = await request.json();

  if (!title_en || !start_time || !end_time) {
    return Response.json(
      { error: 'title_en, start_time, and end_time are required' },
      { status: 400 }
    );
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, price, capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `)
    .bind(user.id, title_en, category || null, start_time, end_time, price || null, capacity || null)
    .run();

  return Response.json({ success: true, id: result.meta.last_row_id }, { status: 201 });
}
