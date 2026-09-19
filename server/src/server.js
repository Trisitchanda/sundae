import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import { startKeepAlive } from './services/keepAliveService.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    startKeepAlive();
  });
}).catch(err => {
  logger.error('Failed to connect to DB', err);
  process.exit(1);
});
