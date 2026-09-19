import express from 'express';
import { getKeepAliveStatus, pingBackendNow } from '../services/keepAliveService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    keepAlive: getKeepAliveStatus(),
  });
});

router.get('/ping', async (req, res) => {
  const result = await pingBackendNow();
  res.json({
    message: 'Manual keep-alive ping triggered',
    result,
    keepAlive: getKeepAliveStatus(),
  });
});

export default router;
