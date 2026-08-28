import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import { initSocket } from './sockets/socketHandler.js';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize Redis connection
    await initRedis();

    // 3. Create HTTP server
    const server = http.createServer(app);

    // 4. Initialize Socket.IO
    initSocket(server, config.clientUrl);

    // 5. Start listening
    server.listen(config.port, () => {
      logger.info(`========================================================`);
      logger.info(`🚀 Servora Server listening on http://localhost:${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`📡 Client Origin: ${config.clientUrl}`);
      logger.info(`💾 Database: ${config.mongoUri}`);
      logger.info(`⚡ Redis: ${config.redis.url}`);
      logger.info(`========================================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      logger.info('Shutting down Servora server...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error(`Fatal Server Startup Error: ${err.message}`, err.stack);
    process.exit(1);
  }
};

startServer();
