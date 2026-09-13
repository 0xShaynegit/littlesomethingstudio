// GET /api/listings?category=yoga
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let query = `
    SELECT listings.*, users.name AS facilitator_name, users.line_id AS facilitator_line
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
