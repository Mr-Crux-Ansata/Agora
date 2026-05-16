import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { getPool } from './lib/db.js';
import healthRoutes from './routes/health.js';
import cycleRoutes from './routes/cycles.js';
import proposalRoutes from './routes/proposals.js';
import resultRoutes from './routes/results.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Agora backend running' });
});

app.use('/api/health', healthRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/results', resultRoutes);

app.use((err, _req, res, _next) => {
  // Surface SQL errors with a safe message while preserving trigger detail.
  const statusCode = Number(err.status) || 500;
  const message = err?.originalError?.info?.message || err.message || 'Unexpected server error.';
  res.status(statusCode).json({ message });
});

const start = async () => {
  app.listen(config.port, async () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${config.port}`);

    try {
      await getPool();
      // eslint-disable-next-line no-console
      console.log('Database connection ready.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Database not reachable yet: ${error.message}`);
    }
  });
};

start();
