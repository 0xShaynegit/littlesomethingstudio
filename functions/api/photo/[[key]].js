// GET /api/photo/<key>: serves a photo stored in R2. Public, no auth: a
// facilitator's profile photo and a listing's photo are shown on public pages.
export async function onRequestGet(context) {
  const { env, params } = context;
  const key = Array.isArray(params.key) ? params.key.join('/') : params.key;

  const object = await env.PHOTOS.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(object.body, { headers });
}
