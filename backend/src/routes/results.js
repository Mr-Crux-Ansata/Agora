import { Router } from 'express';
import { getPool, sql } from '../lib/db.js';

const router = Router();

router.get('/:cycleId', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('cycleId', sql.UniqueIdentifier, cycleId)
      .query(`
        SELECT rank_position, proposal_id, title, description, execution_status, impact_status,
               votes_count, approved_budget, announced_at, neighborhood_name, category_name
        FROM pb.v_results_publication
        WHERE proposal_id IN (
          SELECT proposal_id
          FROM pb.winning_projects
          WHERE cycle_id = @cycleId
        )
        ORDER BY rank_position ASC
      `);

    return res.json(result.recordset);
  } catch (error) {
    return next(error);
  }
});

export default router;
