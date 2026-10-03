// PUT /api/listings/:id
// Admin can edit any listing, a facilitator only their own. Form data, same fields
// as listing creation (photo optional, keeps the current one if omitted).
// Finished listings are archived out of `listings`, so they return 404 here.
// A facilitator changing the time of an approved listing sends it back to 'pending'.
// An admin changing the time of an approved listing gets a 409 conflict list unless
// confirm_conflict=true. Capacity can't drop below the current booking count.

import { getSessionUser } from '../_auth-helper.js';
import { archivePastListings } from '../_archive.js';
import { uploadPhoto } from '../_upload.js';

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (user.role !== 'admin' && user.role !== 'facilitator') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  await archivePastListings(env);

  const listing = await env.DB
    .prepare('SELECT id, facilitator_id, start_time, end_time, status, photo_key FROM listings WHERE id = ?')
    .bind(params.id)
    .first();

  if (!listing) {
    return Response.json({ error: 'Listing not found or already finished' }, { status: 404 });
  }
  if (user.role === 'facilitator' && listing.facilitator_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await request.formData();
  const title_en = form.get('title_en');
  const category = form.get('category');
  const start_time = form.get('start_time');
  const end_time = form.get('end_time');
  const price = form.get('price');
  const capacity = form.get('capacity');
  const photo = form.get('photo');
  const confirmConflict = form.get('confirm_conflict') === 'true';

  if (!title_en || !start_time || !end_time) {
    return Response.json({ error: 'title_en, start_time, and end_time are required' }, { status: 400 });
  }
  const timeFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  if (!timeFormat.test(start_time) || !timeFormat.test(end_time)) {
    return Response.json({ error: 'Times must be in YYYY-MM-DD HH:MM format' }, { status: 400 });
  }
  if (end_time <= start_time) {
    return Response.json({ error: 'End time must be after start time' }, { status: 400 });
  }

  if (capacity) {
    const { count } = await env.DB
      .prepare('SELECT COUNT(*) AS count FROM bookings WHERE listing_id = ?')
      .bind(listing.id)
      .first();
    if (Number(capacity) < count) {
      return Response.json({ error: `${count} people have already booked, capacity can't go below that` }, { status: 400 });
    }
  }

  const timeChanged = start_time !== listing.start_time || end_time !== listing.end_time;
  let newStatus = listing.status;

  if (timeChanged && listing.status === 'approved') {
    if (user.role === 'facilitator') {
      newStatus = 'pending';
    } else if (!confirmConflict) {
      const { results: conflicts } = await env.DB
        .prepare(`
          SELECT listings.id, listings.title_en, listings.start_time, listings.end_time, users.name AS facilitator_name
          FROM listings
          JOIN users ON listings.facilitator_id = users.id
          WHERE listings.status = 'approved'
            AND listings.id != ?
            AND listings.start_time < ?
            AND listings.end_time > ?
        `)
        .bind(listing.id, end_time, start_time)
        .all();
      if (conflicts.length > 0) {
        return Response.json({ error: 'Time conflict with existing approved listing', conflicts }, { status: 409 });
      }
    }
  }

  let photoKey = listing.photo_key;
  if (photo && photo.size > 0) {
    const result = await uploadPhoto(env, photo, 'listings');
    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    photoKey = result.key;
  }

  await env.DB
    .prepare(`
      UPDATE listings
      SET title_en = ?, category = ?, start_time = ?, end_time = ?, price = ?, capacity = ?, photo_key = ?, status = ?
      WHERE id = ?
    `)
    .bind(title_en, category || null, start_time, end_time, price || null, capacity || null, photoKey, newStatus, listing.id)
    .run();

  return Response.json({ success: true, id: listing.id, status: newStatus });
}
