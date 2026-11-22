import crypto from 'crypto';

function getR2Config() {
  const bucketName = (process.env.R2_BUCKET_NAME || '').trim();
  const publicUrl = (process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  const accountId = (process.env.R2_ACCOUNT_ID || '').trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();

  return {
    bucketName,
    publicUrl,
    accountId,
    accessKeyId,
    secretAccessKey,
    isConfigured: Boolean(bucketName && publicUrl && accountId && accessKeyId && secretAccessKey),
  };
}

export function isR2Configured(): boolean {
  return getR2Config().isConfigured;
}

export function isR2PrivateConfigured(): boolean {
  const { bucketName, accountId, accessKeyId, secretAccessKey } = getR2Config();
  return Boolean(bucketName && accountId && accessKeyId && secretAccessKey);
}

export function buildR2PrivateObjectUrl(key: string): string {
  const { bucketName, accountId } = getR2Config();
  const cleanKey = key.replace(/^\/+/, '');
  const encodedKey = encodeR2Path(cleanKey);
  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${encodedKey}`;
}

export function extractR2PrivateKey(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.endsWith('.r2.cloudflarestorage.com')) return null;
    const { bucketName } = getR2Config();
    const pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    if (bucketName && pathname.startsWith(`${bucketName}/`)) {
      const rel = pathname.slice(bucketName.length + 1).replace(/^\/+/, '');
      if (rel && !rel.includes('..')) return rel;
    }
    const firstSlash = pathname.indexOf('/');
    if (firstSlash > 0) {
      const rel = pathname.slice(firstSlash + 1).replace(/^\/+/, '');
      if (rel && !rel.includes('..')) return rel;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Mint a short-lived AWS SigV4 presigned GET URL directly against R2's private S3 endpoint.
 * Zero extra network calls (<1ms local HMAC signing). Expires in `expiresSec` (default 900s = 15m).
 */
export function presignR2GetUrl(key: string, expiresSec = 900): string | null {
  const { bucketName, accountId, accessKeyId, secretAccessKey } = getR2Config();
  if (!bucketName || !accountId || !accessKeyId || !secretAccessKey) return null;

  const cleanKey = key.replace(/^\/+/, '');
  const encodedKey = encodeR2Path(cleanKey);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const { amzDate, dateStamp } = formatAmzDate();
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;

  const encParam = (s: string) =>
    encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

  const queryPairs: Array<[string, string]> = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${accessKeyId}/${credentialScope}`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(Math.max(60, Math.min(3600, expiresSec)))],
    ['X-Amz-SignedHeaders', 'host'],
  ];
  const canonicalQuery = queryPairs.map(([k, v]) => `${encParam(k)}=${encParam(v)}`).join('&');
  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');
  const signingKey = getSigningKey(secretAccessKey, dateStamp, 'auto', 's3');
  const signature = hmacHex(signingKey, stringToSign);

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/**
 * Upload private evidence photo bytes to R2 private S3 endpoint (returns canonical private https:// URL + presigned read URL).
 */
export async function uploadPrivateToR2(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  expiresSec?: number;
}): Promise<{ key: string; storageUrl: string; signedUrl: string | null }> {
  const { bucketName, accountId, accessKeyId, secretAccessKey } = getR2Config();
  if (!bucketName || !accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Cloudflare R2 private storage credentials are not configured.');
  }

  const cleanKey = params.key.replace(/^\/+/, '');
  const encodedKey = encodeR2Path(cleanKey);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const bufferBody = Buffer.isBuffer(params.body) ? params.body : Buffer.from(params.body);
  const payloadHash = sha256Hex(bufferBody);
  const { amzDate, dateStamp } = formatAmzDate();
  const cacheControl = 'private, max-age=31536000, immutable';

  const headersToSign: Record<string, string> = {
    'cache-control': cacheControl,
    'content-type': params.contentType,
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headersToSign[k].trim()}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(secretAccessKey, dateStamp, 'auto', 's3');
  const signature = hmacHex(signingKey, stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Cache-Control': cacheControl,
      'Content-Type': params.contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: new Uint8Array(bufferBody),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Private R2 storage upload failed (HTTP ${res.status}): ${errText.slice(0, 300)}`);
  }

  return {
    key: cleanKey,
    storageUrl: buildR2PrivateObjectUrl(cleanKey),
    signedUrl: presignR2GetUrl(cleanKey, params.expiresSec ?? 900),
  };
}

function sha256Hex(data: Buffer | Uint8Array | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function hmacHex(key: Buffer | string, data: string): string {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
}

function getSigningKey(secretAccessKey: string, dateStamp: string, region = 'auto', service = 's3'): Buffer {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function encodeR2Path(key: string): string {
  return key
    .replace(/^\/+/, '')
    .split('/')
    .map((segment) =>
      encodeURIComponent(segment).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    )
    .join('/');
}

function formatAmzDate(date = new Date()): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

export interface UploadToR2Params {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
}

export async function uploadToR2({
  key,
  body,
  contentType,
  cacheControl = 'public, max-age=31536000, immutable',
}: UploadToR2Params): Promise<{ key: string; url: string }> {
  const { bucketName, publicUrl, accountId, accessKeyId, secretAccessKey, isConfigured } = getR2Config();

  if (!isConfigured) {
    throw new Error('Cloudflare R2 credentials are not configured in environment variables.');
  }

  const cleanKey = key.replace(/^\/+/, '');
  const encodedKey = encodeR2Path(cleanKey);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const bufferBody = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const payloadHash = sha256Hex(bufferBody);
  const { amzDate, dateStamp } = formatAmzDate();

  const headersToSign: Record<string, string> = {
    'cache-control': cacheControl,
    'content-type': contentType,
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headersToSign[k].trim()}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(secretAccessKey, dateStamp, 'auto', 's3');
  const signature = hmacHex(signingKey, stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Cache-Control': cacheControl,
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: new Uint8Array(bufferBody),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Cloudflare R2 upload failed (HTTP ${res.status}): ${errText.slice(0, 300)}`);
  }

  return {
    key: cleanKey,
    url: `${publicUrl}/${encodedKey}`,
  };
}

export async function deleteFromR2(keyOrUrl: string): Promise<void> {
  const { bucketName, publicUrl, accountId, accessKeyId, secretAccessKey, isConfigured } = getR2Config();

  if (!isConfigured || !keyOrUrl) return;

  let cleanKey = keyOrUrl.trim();
  if (cleanKey.startsWith(publicUrl)) {
    cleanKey = cleanKey.slice(publicUrl.length);
  } else if (cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) {
    try {
      const parsed = new URL(cleanKey);
      cleanKey = parsed.pathname;
    } catch {
      return;
    }
  }
  cleanKey = cleanKey.replace(/^\/+/, '');
  if (!cleanKey) return;

  const encodedKey = encodeR2Path(cleanKey);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const payloadHash = sha256Hex('');
  const { amzDate, dateStamp } = formatAmzDate();

  const headersToSign: Record<string, string> = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headersToSign[k].trim()}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [
    'DELETE',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(secretAccessKey, dateStamp, 'auto', 's3');
  const signature = hmacHex(signingKey, stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: authorization,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
  });

  if (!res.ok && res.status !== 404) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Cloudflare R2 delete failed (HTTP ${res.status}): ${errText.slice(0, 300)}`);
  }
}

const ALLOWED_MIME_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

/**
 * Automatic fallback helper: if a caller passes a `data:image/...;base64,...` string
 * and R2 is configured, decodes it, uploads to Cloudflare R2 under a tenant-isolated key,
 * and returns the clean public CDN URL. If already an https:// URL, returns it as-is.
 */
export async function ensureR2PhotoUrl(params: {
  photoUrl?: string | null;
  organizationId: string;
  folder?: 'inspections' | 'equipment' | 'defects';
}): Promise<string | null> {
  const { photoUrl, organizationId, folder = 'equipment' } = params;
  if (!photoUrl || typeof photoUrl !== 'string') return null;

  const trimmed = photoUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('data:image/') && isR2Configured()) {
    const match = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (!match) return trimmed;

    const mimeType = match[1].toLowerCase();
    const ext = ALLOWED_MIME_EXT[mimeType];
    if (!ext) {
      throw new Error(`Unsupported image type: ${mimeType}. Allowed: WebP, JPEG, PNG.`);
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.byteLength > 4 * 1024 * 1024) {
      throw new Error('Image exceeds maximum allowed size of 4 MB.');
    }

    const safeOrgId = (organizationId || 'common').replace(/[^a-zA-Z0-9_-]/g, '');
    const safeFolder = ['inspections', 'equipment', 'defects'].includes(folder) ? folder : 'equipment';
    const key = `orgs/${safeOrgId}/${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const uploaded = await uploadToR2({
      key,
      body: buffer,
      contentType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
    });
    return uploaded.url;
  }

  return trimmed;
}
