import { Router } from 'express';
import { getPool, sql } from '../lib/db.js';

const router = Router();

router.get('/:cycleId/current-phase', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('cycleId', sql.UniqueIdentifier, cycleId)
      .query(`
        SELECT TOP 1 id, cycle_id, phase, starts_at, ends_at, is_current
        FROM pb.cycle_phases
        WHERE cycle_id = @cycleId
          AND (is_current = 1 OR SYSUTCDATETIME() BETWEEN starts_at AND ends_at)
        ORDER BY is_current DESC, starts_at DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No active phase found for cycle.' });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    return next(error);
  }
});

export default router;
