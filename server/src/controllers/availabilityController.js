// Authors:
// Wei-Sen Wang - 261116291
// Hooman Azari - 261055604

const pool = require('../config/db');
const crypto = require('crypto');

/**
 * Submit votes for a group meeting
 * POST /api/slots/:token/vote
 */
async function submitVote(req, res) {
  const { token } = req.params;
  const { selected_option_ids } = req.body;
  const user_id = req.user.userId;

  if (!selected_option_ids || !Array.isArray(selected_option_ids) || selected_option_ids.length === 0) {
    return res.status(400).json({ error: 'Must select at least one time slot' });
  }

  try {
    // Get the slot by invite token
    const [slots] = await pool.execute(
      'SELECT id FROM slots WHERE invite_token = ? AND type = "group"',
      [token]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Invalid invite token' });
    }

    const slotId = slots[0].id;

    // Delete existing votes from this user for this slot
    await pool.execute(
      'DELETE FROM availability_responses WHERE slot_id = ? AND user_id = ?',
      [slotId, user_id]
    );

    // Reset vote counts for all options (we'll recalculate)
    await pool.execute(
      'UPDATE group_slot_options SET vote_count = 0 WHERE slot_id = ?',
      [slotId]
    );

    // Insert new votes
    for (const optionId of selected_option_ids) {
      const voteId = crypto.randomUUID();
      await pool.execute(
        `INSERT INTO availability_responses (id, slot_id, user_id, group_slot_option_id)
         VALUES (?, ?, ?, ?)`,
        [voteId, slotId, user_id, optionId]
      );
    }

    // Recalculate vote counts for all options
    const [options] = await pool.execute(
      'SELECT id FROM group_slot_options WHERE slot_id = ?',
      [slotId]
    );

    for (const option of options) {
      const [counts] = await pool.execute(
        'SELECT COUNT(*) as count FROM availability_responses WHERE group_slot_option_id = ?',
        [option.id]
      );
      await pool.execute(
        'UPDATE group_slot_options SET vote_count = ? WHERE id = ?',
        [counts[0].count, option.id]
      );
    }

    res.json({ message: 'Votes submitted successfully', votes_count: selected_option_ids.length });
  } catch (err) {
    console.error('Error submitting vote:', err);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
}

/**
 * Get user's votes for a specific slot
 * GET /api/slots/:token/my-votes
 */
async function getMyVotes(req, res) {
  const { token } = req.params;
  const user_id = req.user.userId;

  try {
    const [slots] = await pool.execute(
      'SELECT id FROM slots WHERE invite_token = ?',
      [token]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Invalid invite token' });
    }

    const [votes] = await pool.execute(
      `SELECT ar.group_slot_option_id
       FROM availability_responses ar
       WHERE ar.slot_id = ? AND ar.user_id = ?`,
      [slots[0].id, user_id]
    );

    res.json(votes.map(v => v.group_slot_option_id));
  } catch (err) {
    console.error('Error fetching votes:', err);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}

module.exports = {
  submitVote,
  getMyVotes,
};