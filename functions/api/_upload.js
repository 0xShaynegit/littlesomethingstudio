// Shared helper: stores an uploaded photo in R2 and returns its key.
// Used by facilitator signup and listing creation.
// Every photo is normalized to WebP, capped at MAX_DIMENSION on the long
// edge, and shrunk further if needed to land under MAX_BYTES.
import { PhotonImage, SamplingFilter, resize } from '@cf-wasm/photon/workerd';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 200 * 1024;
const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 400;

function toWebpUnderLimit(sourceImage) {
  let width = sourceImage.get_width();
  let height = sourceImage.get_height();

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  let image = resize(sourceImage, width, height, SamplingFilter.Lanczos3);
  let bytes = image.get_bytes_webp();

  while (bytes.byteLength > MAX_OUTPUT_BYTES && Math.max(width, height) > MIN_DIMENSION) {
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
    image.free();
    image = resize(sourceImage, width, height, SamplingFilter.Lanczos3);
    bytes = image.get_bytes_webp();
  }

  image.free();
  return bytes;
}

export async function uploadPhoto(env, file, prefix) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { error: 'No photo file provided' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Photo must be JPEG, PNG, or WebP' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: 'Photo must be under 15MB' };
  }

  const inputBytes = new Uint8Array(await file.arrayBuffer());
  const sourceImage = PhotonImage.new_from_byteslice(inputBytes);
  const webpBytes = toWebpUnderLimit(sourceImage);
  sourceImage.free();

  const key = `${prefix}/${crypto.randomUUID()}.webp`;

  await env.PHOTOS.put(key, webpBytes, {
    httpMetadata: { contentType: 'image/webp' },
  });

  return { key };
}
