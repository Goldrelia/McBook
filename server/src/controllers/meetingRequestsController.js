// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

const pool = require('../config/db');

/**
 * Send a meeting request to an owner
 * POST /api/meeting-requests
 */
async function createMeetingRequest(req, res) {
  const { owner_id, message } = req.body;
  const requester_id = req.user.userId;

  if (!owner_id) {
    return res.status(400).json({ error: 'owner_id is required' });
  }

  try {
    // Verify owner exists and is actually an owner
    const [owners] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND role = "owner"',
      [owner_id]
    );

    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Create meeting request
    const [result] = await pool.execute(
      'INSERT INTO meeting_requests (requester_id, owner_id, message, status) VALUES (?, ?, ?, "pending")',
      [requester_id, owner_id, message]
    );

    // Create notification for owner
    const [requester] = await pool.execute('SELECT email FROM users WHERE id = ?', [requester_id]);
    await pool.execute(
      `INSERT INTO notifications (user_id, type, message)
       VALUES (?, 'meeting_request', ?)`,
      [owner_id, `New meeting request from ${requester[0].email}`]
    );

    // Fetch the created request
    const [newRequest] = await pool.execute(
      `SELECT mr.*, u.email as requester_email
       FROM meeting_requests mr
       JOIN users u ON mr.requester_id = u.id
       WHERE mr.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRequest[0]);
  } catch (err) {
    console.error('Error creating meeting request:', err);
    res.status(500).json({ error: 'Failed to create meeting request' });
  }
}

/**
 * Get all meeting requests for an owner
 * GET /api/meeting-requests
 */
async function getOwnerRequests(req, res) {
  const owner_id = req.user.userId;

  try {
    const [requests] = await pool.execute(
      `SELECT mr.*, u.email as requester_email
       FROM meeting_requests mr
       JOIN users u ON mr.requester_id = u.id
       WHERE mr.owner_id = ?
       ORDER BY mr.created_at DESC`,
      [owner_id]
    );

    res.json(requests);
  } catch (err) {
    console.error('Error fetching meeting requests:', err);
    res.status(500).json({ error: 'Failed to fetch meeting requests' });
  }
}

/**
 * Accept or decline a meeting request
 * PATCH /api/meeting-requests/:id
 */
async function updateMeetingRequest(req, res) {
  const { id } = req.params;
  const owner_id = req.user.userId;
  const { status } = req.body;

  if (!status || !['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "declined"' });
  }

  try {
    // Verify request exists and belongs to this owner
    const [requests] = await pool.execute(
      'SELECT * FROM meeting_requests WHERE id = ? AND owner_id = ?',
      [id, owner_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Meeting request not found or unauthorized' });
    }

    const request = requests[0];

    // Update request status
    await pool.execute(
      'UPDATE meeting_requests SET status = ? WHERE id = ?',
      [status, id]
    );

    // Create notification for requester
    const notifMessage = status === 'accepted' 
      ? 'Your meeting request was accepted!'
      : 'Your meeting request was declined.';

    await pool.execute(
      `INSERT INTO notifications (user_id, type, message)
       VALUES (?, 'request_${status}', ?)`,
      [request.requester_id, notifMessage]
    );

    // Fetch updated request
    const [updated] = await pool.execute(
      `SELECT mr.*, u.email as requester_email
       FROM meeting_requests mr
       JOIN users u ON mr.requester_id = u.id
       WHERE mr.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating meeting request:', err);
    res.status(500).json({ error: 'Failed to update meeting request' });
  }
}

module.exports = {
  createMeetingRequest,
  getOwnerRequests,
  updateMeetingRequest,
};
