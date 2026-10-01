// GET /api/reviews
// Public. Returns reviews, newest first.

export async function onRequestGet(context) {
  const { env } = context;

  const { results } = await env.DB
    .prepare('SELECT * FROM reviews ORDER BY published_at DESC, id DESC')
    .all();

  return Response.json({ reviews: results });
}
