// Shared helper: stores an uploaded photo in R2 and returns its key.
// Used by facilitator signup and listing creation.
// The browser converts photos to WebP and shrinks them under MAX_BYTES
// before upload (see resizeToWebp in js/photo-upload.js); the Worker only
// validates and stores, since decoding/re-encoding images here exceeds the
// Workers CPU time limit.
const MAX_BYTES = 220 * 1024; // small margin over the browser's 200KB target

export async function uploadPhoto(env, file, prefix) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { error: 'No photo file provided' };
  }
  if (file.type !== 'image/webp') {
    return { error: 'Photo must be WebP' };
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Photo must be under 200KB' };
  }

  const key = `${prefix}/${crypto.randomUUID()}.webp`;

  await env.PHOTOS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: 'image/webp' },
  });

  return { key };
}
