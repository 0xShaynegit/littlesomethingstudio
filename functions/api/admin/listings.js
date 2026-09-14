// GET /api/admin/listings
// Admin only. Returns all listings across all facilitators, any status.
// Each listing includes a "conflicts" array of other approved listings whose time overlaps.

import { getSessionUser } from '../_auth-helper.js';
import { archivePastListings } from '../_archive.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await getSessionUser(context);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  await archivePastListings(env);

  const { results } = await env.DB
    .prepare(`
      SELECT listings.*, users.name AS facilitator_name
      FROM listings
      JOIN users ON listings.facilitator_id = users.id
      ORDER BY listings.status ASC, listings.start_time ASC
    `)
    .all();

  // For every listing, find approved listings whose time range overlaps it (excluding itself and declined ones)
  const approved = results.filter(l => l.status === 'approved');

  const withConflicts = results.map(listing => {
    const conflicts = approved.filter(other =>
      other.id !== listing.id &&
      listing.start_time < other.end_time &&
      listing.end_time > other.start_time
    ).map(c => ({ id: c.id, title_en: c.title_en, facilitator_name: c.facilitator_name, start_time: c.start_time, end_time: c.end_time }));

    return { ...listing, conflicts };
  });

  return Response.json({ listings: withConflicts });
}
