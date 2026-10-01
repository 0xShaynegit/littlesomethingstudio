import { archivePastListings } from './_archive.js';

// GET /api/listings?category=yoga
export async function onRequestGet(context) {
  const { env, request } = context;
  await archivePastListings(env);
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let query = `
    SELECT listings.*, users.name AS facilitator_name,
      (
        SELECT GROUP_CONCAT(extra.name, ', ')
        FROM session_instructors si
        JOIN users extra ON extra.id = si.user_id
        WHERE si.listing_id = listings.id AND extra.id != listings.facilitator_id
      ) AS extra_instructor_names,
      (SELECT id FROM studio_updates WHERE studio_updates.listing_id = listings.id ORDER BY published_at DESC LIMIT 1) AS update_id
    FROM listings
    JOIN users ON listings.facilitator_id = users.id
    WHERE listings.status = 'approved'
  `;
  const params = [];
  if (category) {
    query += ' AND listings.category = ?';
    params.push(category);
  }
  query += ' ORDER BY listings.start_time ASC';

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return Response.json({ listings: results });
}
