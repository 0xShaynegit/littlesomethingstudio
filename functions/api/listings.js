import { archivePastListings } from './_archive.js';

// GET /api/listings?category=yoga
export async function onRequestGet(context) {
  const { env, request } = context;
  await archivePastListings(env);
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let query = `
    SELECT listings.*, users.name AS facilitator_name
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
