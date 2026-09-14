// GET /api/my-listings: returns the logged-in facilitator's own listings, any status
// POST /api/my-listings: facilitator creates a new listing, always starts as 'pending'

import { getSessionUser } from './_auth-helper.js';
import { archivePastListings } from './_archive.js';
import { uploadPhoto } from './_upload.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  await archivePastListings(env);

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

  const form = await request.formData();
  const title_en = form.get('title_en');
  const category = form.get('category');
  const start_time = form.get('start_time');
  const end_time = form.get('end_time');
  const price = form.get('price');
  const capacity = form.get('capacity');
  const photo = form.get('photo');

  if (!title_en || !start_time || !end_time) {
    return Response.json(
      { error: 'title_en, start_time, and end_time are required' },
      { status: 400 }
    );
  }

  let photoKey = null;
  if (photo && photo.size > 0) {
    const result = await uploadPhoto(env, photo, 'listings');
    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    photoKey = result.key;
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO listings (facilitator_id, title_en, category, start_time, end_time, price, capacity, photo_key, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `)
    .bind(user.id, title_en, category || null, start_time, end_time, price || null, capacity || null, photoKey)
    .run();

  return Response.json({ success: true, id: result.meta.last_row_id }, { status: 201 });
}
