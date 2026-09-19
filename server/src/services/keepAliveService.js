import logger from '../utils/logger.js';

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      lastPingAt: null,
      lastStatus: null,
      lastDurationMs: null,
      lastError: null,
    };
  }

  getTargetUrl() {
    const rawBase = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || 'https://sundae-1d1g.onrender.com';
    const base = rawBase.replace(/\/+$/, '');
    return `${base}/api/health`;
  }

  getIntervalMs() {
    const interval = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS || '15000', 10);
    return isNaN(interval) || interval < 1000 ? 15000 : interval;
  }

  isEnabled() {
    if (process.env.NODE_ENV === 'test') return false;
    if (process.env.ENABLE_KEEP_ALIVE === 'false') return false;
    return true;
  }

  async pingBackend() {
    const targetUrl = this.getTargetUrl();
    const startTime = Date.now();
    this.stats.totalPings += 1;
    this.stats.lastPingAt = new Date().toISOString();

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Sundae-KeepAlive-Worker/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      const duration = Date.now() - startTime;
      this.stats.lastDurationMs = duration;
      this.stats.lastStatus = response.status;
      this.stats.lastError = null;

      if (response.ok) {
        this.stats.successfulPings += 1;
        logger.info(`[KeepAlive] Ping successful to ${targetUrl} (${response.status} in ${duration}ms)`);
      } else {
        this.stats.failedPings += 1;
        logger.warn(`[KeepAlive] Ping received non-2xx status from ${targetUrl}: ${response.status}`);
      }

      return {
        success: response.ok,
        status: response.status,
        durationMs: duration,
        targetUrl,
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      this.stats.failedPings += 1;
      this.stats.lastDurationMs = duration;
      this.stats.lastStatus = err.name || 'ERROR';
      this.stats.lastError = err.message;

      logger.warn(`[KeepAlive] Ping failed for ${targetUrl}: ${err.message}`);

      return {
        success: false,
        error: err.message,
        durationMs: duration,
        targetUrl,
      };
    }
  }

  start() {
    if (!this.isEnabled()) {
      logger.info('[KeepAlive] Keep-alive worker is disabled (test environment or explicitly turned off).');
      return;
    }

    if (this.isRunning) {
      logger.info('[KeepAlive] Keep-alive worker is already running.');
      return;
    }

    const intervalMs = this.getIntervalMs();
    const targetUrl = this.getTargetUrl();

    this.isRunning = true;
    logger.info(`[KeepAlive] Starting keep-alive worker targeting ${targetUrl} every ${intervalMs / 1000}s`);

    // Initial ping after 5 seconds to let the server finish binding
    const initialTimer = setTimeout(() => {
      this.pingBackend();
    }, 5000);
    if (initialTimer.unref) initialTimer.unref();

    this.intervalId = setInterval(() => {
      this.pingBackend();
    }, intervalMs);

    if (this.intervalId.unref) {
      this.intervalId.unref();
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('[KeepAlive] Keep-alive worker stopped.');
  }

  getStatus() {
    return {
      enabled: this.isEnabled(),
      isRunning: this.isRunning,
      targetUrl: this.getTargetUrl(),
      intervalMs: this.getIntervalMs(),
      intervalSeconds: Math.round(this.getIntervalMs() / 1000),
      stats: { ...this.stats },
    };
  }
}

const keepAliveService = new KeepAliveService();

export const startKeepAlive = () => keepAliveService.start();
export const stopKeepAlive = () => keepAliveService.stop();
export const pingBackendNow = () => keepAliveService.pingBackend();
export const getKeepAliveStatus = () => keepAliveService.getStatus();

export default keepAliveService;
