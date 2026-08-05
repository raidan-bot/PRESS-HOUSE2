import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';

const app = express();

// Core Middleware
const allowedOrigins = [
  'https://ph-ye.org',
  'https://www.ph-ye.org',
  'http://localhost:3000',
  'http://localhost:5173',
];

if (process.env.APP_URL) {
  allowedOrigins.push(process.env.APP_URL.trim());
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow matched origins, .run.app preview domains, and any origin in non-production envs
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.run.app') || !config.isProd) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting (Phase 2.3)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, 
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, 
  message: { message: 'Too many uploads from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/media/upload', uploadLimiter);

// Logging middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API Request] ${req.method} ${req.url}`);
  }
  next();
});

// Setup storage folder
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

import routes from './routes';
app.get('/sitemap.xml', (req, res, next) => {
  req.url = '/api/sitemap.xml';
  routes(req, res, next);
});
app.use('/api', routes);

// Centralized Error Handling Middleware (Phase 4)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Central Error Handler]', err);
  
  const status = err.status || err.statusCode || 500;
  const message = config.isProd 
    ? 'حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً.' 
    : err.message || 'Internal Server Error';
    
  res.status(status).json({
    message,
    ...(config.isProd ? {} : { stack: err.stack, details: err })
  });
});

export default app;
