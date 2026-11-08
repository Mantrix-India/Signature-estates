import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function list(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/** TRUST_PROXY: '' / 'false' -> false, 'true' -> true, '1' -> 1 hop (Render/Railway). */
function trustProxy(value: string | undefined): boolean | number {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  const hops = Number(value);
  return Number.isInteger(hops) && hops >= 0 ? hops : false;
}

export type WebsiteLeadAssignment = 'round_robin' | 'default_agent';

function leadAssignment(value: string | undefined): WebsiteLeadAssignment {
  return value === 'default_agent' ? 'default_agent' : 'round_robin';
}

export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  trustProxy: trustProxy(process.env.TRUST_PROXY),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey: required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },
  publicSite: {
    /** Browser origins allowed on /api/public only. The CRM origin above is unaffected. */
    origins: list(process.env.PUBLIC_SITE_ORIGINS, ['http://localhost:3001']),
    /**
     * Shared secret sent by the website's SERVER (never the browser) as
     * X-Public-Api-Key. When it matches, the X-Client-IP header is trusted for
     * rate limiting — otherwise every visitor would share the website server's IP.
     */
    apiKey: process.env.PUBLIC_API_KEY || '',
    leadAssignment: leadAssignment(process.env.WEBSITE_LEAD_ASSIGNMENT),
    /** Used by `default_agent`, and as the fallback when no active AGENT exists. */
    defaultAgentId: process.env.WEBSITE_DEFAULT_AGENT_ID || '',
    enquiryLimitPerHour: Number(process.env.PUBLIC_ENQUIRY_LIMIT_PER_HOUR || 5),
    readLimitPerMinute: Number(process.env.PUBLIC_READ_LIMIT_PER_MINUTE || 120),
  },
};
