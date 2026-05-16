import { Router } from 'express';
import { getPool, sql } from '../lib/db.js';

const router = Router();

const parseGuid = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value;
};

router.get('/', async (req, res, next) => {
  try {
    const { cycleId, lifecycle, participation, institutional } = req.query;
    const pool = await getPool();

    const request = pool.request();
    const where = [];

    if (cycleId) {
      request.input('cycleId', sql.UniqueIdentifier, String(cycleId));
      where.push('cycle_id = @cycleId');
    }

    if (lifecycle) {
      request.input('lifecycle', sql.NVarChar(40), String(lifecycle));
      where.push('lifecycle_stage = @lifecycle');
    }

    if (participation) {
      request.input('participation', sql.NVarChar(30), String(participation));
      where.push('participation_status = @participation');
    }

    if (institutional) {
      request.input('institutional', sql.NVarChar(30), String(institutional));
      where.push('institutional_status = @institutional');
    }

    const query = `
      SELECT id, cycle_id, title, description, lifecycle_stage, institutional_status,
             participation_status, selection_status, execution_status, impact_status,
             budget_requested, people_benefited_estimated, created_at,
             category_name, neighborhood_name, author_name, votes_count, comments_count
      FROM pb.v_proposal_public_summary
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
    `;

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    return next(error);
  }
});

router.get('/:proposalId', async (req, res, next) => {
  try {
    const proposalId = parseGuid(req.params.proposalId);
    if (!proposalId) {
      return res.status(400).json({ message: 'Invalid proposalId.' });
    }

    const pool = await getPool();

    const proposal = await pool
      .request()
      .input('proposalId', sql.UniqueIdentifier, proposalId)
      .query(`
        SELECT id, cycle_id, title, description, lifecycle_stage, institutional_status,
               participation_status, selection_status, execution_status, impact_status,
               budget_requested, people_benefited_estimated, created_at,
               category_name, neighborhood_name, author_name, votes_count, comments_count
        FROM pb.v_proposal_public_summary
        WHERE id = @proposalId
      `);

    if (proposal.recordset.length === 0) {
      return res.status(404).json({ message: 'Proposal not found.' });
    }

    const threads = await pool
      .request()
      .input('proposalId', sql.UniqueIdentifier, proposalId)
      .query(`
        SELECT id, proposal_id, thread_type, title, is_locked, created_by, created_at
        FROM pb.discussion_threads
        WHERE proposal_id = @proposalId
        ORDER BY created_at ASC
      `);

    return res.json({
      ...proposal.recordset[0],
      threads: threads.recordset
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/:proposalId/votes', async (req, res, next) => {
  try {
    const proposalId = parseGuid(req.params.proposalId);
    const { cycleId, voterId, clientFingerprint, receiptHash } = req.body || {};

    if (!proposalId || !cycleId || !voterId) {
      return res.status(400).json({ message: 'proposalId, cycleId and voterId are required.' });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input('cycleId', sql.UniqueIdentifier, cycleId)
      .input('proposalId', sql.UniqueIdentifier, proposalId)
      .input('voterId', sql.UniqueIdentifier, voterId)
      .input('clientFingerprint', sql.NVarChar(255), clientFingerprint || null)
      .input('receiptHash', sql.NVarChar(255), receiptHash || null)
      .query(`
        INSERT INTO pb.votes (cycle_id, proposal_id, voter_id, client_fingerprint, receipt_hash)
        OUTPUT inserted.id, inserted.cast_at
        VALUES (@cycleId, @proposalId, @voterId, @clientFingerprint, @receiptHash)
      `);

    return res.status(201).json({ message: 'Vote registered.', vote: result.recordset[0] });
  } catch (error) {
    return next(error);
  }
});

router.post('/:proposalId/institutional-reviews', async (req, res, next) => {
  try {
    const proposalId = parseGuid(req.params.proposalId);
    const { reviewerId, decision, isFinal, technicalFeedback, legalFeedback, budgetFeedback, decisionReason } = req.body || {};

    if (!proposalId || !decision) {
      return res.status(400).json({ message: 'proposalId and decision are required.' });
    }

    const allowed = ['approved', 'rejected', 'needs_changes'];
    if (!allowed.includes(String(decision))) {
      return res.status(400).json({ message: 'decision must be approved, rejected or needs_changes.' });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input('proposalId', sql.UniqueIdentifier, proposalId)
      .input('reviewerId', sql.UniqueIdentifier, reviewerId || null)
      .input('decision', sql.NVarChar(20), decision)
      .input('isFinal', sql.Bit, typeof isFinal === 'boolean' ? isFinal : true)
      .input('technicalFeedback', sql.NVarChar(sql.MAX), technicalFeedback || null)
      .input('legalFeedback', sql.NVarChar(sql.MAX), legalFeedback || null)
      .input('budgetFeedback', sql.NVarChar(sql.MAX), budgetFeedback || null)
      .input('decisionReason', sql.NVarChar(1000), decisionReason || null)
      .query(`
        INSERT INTO pb.institutional_reviews (
          proposal_id, reviewer_id, decision, is_final,
          technical_feedback, legal_feedback, budget_feedback, decision_reason
        )
        OUTPUT inserted.id, inserted.reviewed_at
        VALUES (
          @proposalId, @reviewerId, @decision, @isFinal,
          @technicalFeedback, @legalFeedback, @budgetFeedback, @decisionReason
        )
      `);

    return res.status(201).json({ message: 'Review saved.', review: result.recordset[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;
