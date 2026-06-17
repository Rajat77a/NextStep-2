export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltB64 = arrayBufferToBase64Url(salt);

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashB64 = arrayBufferToBase64Url(new Uint8Array(hash));
  return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':');
  if (!saltB64 || !hashB64) return false;

  const salt = base64UrlToArrayBuffer(saltB64);
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const computedHashB64 = arrayBufferToBase64Url(new Uint8Array(hash));
  return computedHashB64 === hashB64;
}

function arrayBufferToBase64Url(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

export function generateToken(userId: string, role: string, schoolId: string | null): string {
  const payload = {
    sub: userId,
    role,
    schoolId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  };
  return btoa(JSON.stringify(payload));
}

export function decodeToken(token: string): { sub: string; role: string; schoolId: string | null; exp: number } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function delay(ms: number = 100): Promise<void> {
  const randomMs = Math.floor(Math.random() * ms) + 50;
  return new Promise(resolve => setTimeout(resolve, randomMs));
}
