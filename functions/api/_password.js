// Password hashing via Web Crypto PBKDF2 (Workers runtime has no Node crypto/bcrypt/argon2).
// Stored format: "pbkdf2:<iterations>:<salt hex>:<hash hex>"
const ITERATIONS = 100000;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

async function deriveBits(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await deriveBits(password, salt, ITERATIONS);
  return `pbkdf2:${ITERATIONS}:${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const iterations = parseInt(parts[1], 10);
  const salt = fromHex(parts[2]);
  const expectedHex = parts[3];

  const bits = await deriveBits(password, salt, iterations);
  const gotHex = toHex(bits);

  if (gotHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < gotHex.length; i++) diff |= gotHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}

// NIST 800-63B style: length is the meaningful control, not forced complexity rules.
export function passwordError(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 200) return 'Password is too long';
  return null;
}
