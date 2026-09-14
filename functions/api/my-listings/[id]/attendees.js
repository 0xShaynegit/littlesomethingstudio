// GET /api/my-listings/:id/attendees
// Facilitator only, and only for their own listing (admin can view any). Returns the booking roster.

import { getSessionUser } from '../../_auth-helper.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const listingId = params.id;

  let listing = await env.DB
    .prepare('SELECT id, facilitator_id, title_en, capacity FROM listings WHERE id = ?')
    .bind(listingId)
    .first();
  let archived = false;

  if (!listing) {
    listing = await env.DB
      .prepare('SELECT id, facilitator_id, title_en, capacity FROM listings_archive WHERE id = ?')
      .bind(listingId)
      .first();
    archived = true;
  }

  if (!listing) {
    return Response.json({ error: 'Listing not found' }, { status: 404 });
  }

  const isOwner = listing.facilitator_id === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { results: attendees } = await env.DB
    .prepare(`
      SELECT id, attendee_name, attendee_phone, attendee_line, payment_method, payment_status, created_at
      FROM ${archived ? 'bookings_archive' : 'bookings'}
      WHERE listing_id = ?
      ORDER BY created_at ASC
    `)
    .bind(listingId)
    .all();

  return Response.json({
    listing: { id: listing.id, title_en: listing.title_en, capacity: listing.capacity },
    attendees,
    spots_filled: attendees.length
  });
}
