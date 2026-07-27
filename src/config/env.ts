import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    console.error('\x1b[31mCRITICAL ERROR: JWT_SECRET environment variable is missing in production. Server cannot start!\x1b[0m');
    process.exit(1);
  } else {
    // Generate a random secure JWT secret on every startup in development
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.log('\x1b[33m[Dev] JWT_SECRET not provided. Generated random one-time secret for this session.\x1b[0m');
  }
} else if (jwtSecret === 'insecure-default-change-me-in-settings' || jwtSecret.trim() === '') {
  if (isProduction) {
    console.error('\x1b[31mCRITICAL ERROR: Insecure JWT_SECRET is not allowed in production. Server cannot start!\x1b[0m');
    process.exit(1);
  } else {
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.log('\x1b[33m[Dev] Insecure placeholder JWT_SECRET detected. Replaced with random secure secret.\x1b[0m');
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: isProduction,
  jwtSecret: jwtSecret,
  appUrl: process.env.APP_URL || '',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
  ai: {
    geminiKey: process.env.GEMINI_API_KEY,
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
    baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    primaryModel: process.env.AI_MODEL_PRIMARY || 'gpt-4o-mini',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'web@ph-ye.org',
  }
};

