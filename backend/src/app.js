import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { config } from './config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      config.clientUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// HTTP request logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers for JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (Uploads)
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Also serve frontend statically if built or during integrated run
const frontendDistPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendDistPath));

// Apply global API rate limiter
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', routes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
