// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

const pool = require('../config/db');
const crypto = require('crypto');

function parseField(message, key) {
  const line = String(message || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.toLowerCase().startsWith(`${key.toLowerCase()}:`));
  return line ? line.split(':').slice(1).join(':').trim() : '';
}

/**
 * Convert 12-hour time format (8:00am) to 24-hour format (08:00:00)
 */
function convertTo24Hour(time12h) {
  if (!time12h) return '00:00:00';
  
  // Match format like "8:00am" or "8:00pm"
  const match = time12h.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return '00:00:00';
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toLowerCase();
  
  // Convert to 24-hour
  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

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
    const requestId = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO meeting_requests (id, requester_id, owner_id, message, status) VALUES (?, ?, ?, ?, "pending")',
      [requestId, requester_id, owner_id, message]
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
      [requestId]
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
 * Get all meeting requests submitted by a user
 * GET /api/meeting-requests/mine
 */
async function getUserRequests(req, res) {
  const requester_id = req.user.userId;

  try {
    const [requests] = await pool.execute(
      `SELECT mr.*, u.email as owner_email
       FROM meeting_requests mr
       JOIN users u ON mr.owner_id = u.id
       WHERE mr.requester_id = ?
       ORDER BY mr.created_at DESC`,
      [requester_id]
    );

    res.json(requests);
  } catch (err) {
    console.error('Error fetching user meeting requests:', err);
    res.status(500).json({ error: 'Failed to fetch your meeting requests' });
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

    let notifMessage = status === 'accepted'
      ? 'Your meeting request was accepted!'
      : 'Your meeting request was declined.';

    // Type 1 behavior: if accepted, create an appointment visible on both dashboards.
    if (status === 'accepted') {
      const [requesterRows] = await pool.execute(
        'SELECT email FROM users WHERE id = ?',
        [request.requester_id]
      );
      const requesterEmail = requesterRows[0]?.email || 'student';

      const slotId = crypto.randomUUID();
      const bookingId = crypto.randomUUID();
      const requestedDate = parseField(request.message, 'Preferred date');
      const requestedTime = parseField(request.message, 'Preferred time');
      const requestedTopic = parseField(request.message, 'Topic');
      
      // Parse the time range (e.g., "8:00am - 8:15am")
      const [startRaw = '', endRaw = ''] = requestedTime.split('-').map((s) => s.trim());

      // Convert times to 24-hour format for MySQL
      const start24 = convertTo24Hour(startRaw);
      const end24 = convertTo24Hour(endRaw);
      
      const startTime =
        requestedDate && startRaw
          ? `${requestedDate} ${start24}`
          : new Date().toISOString().slice(0, 19).replace('T', ' ');

      const endTime =
        requestedDate && endRaw
          ? `${requestedDate} ${end24}`
          : (() => {
              const fallbackEnd = new Date();
              fallbackEnd.setMinutes(fallbackEnd.getMinutes() + 30);
              return fallbackEnd.toISOString().slice(0, 19).replace('T', ' ');
            })();

      const slotTitle = requestedTopic || `Meeting Request with ${requesterEmail}`;

      await pool.execute(
        `INSERT INTO slots (id, owner_id, title, type, status, start_time, end_time, location)
         VALUES (?, ?, ?, 'request', 'active', ?, ?, ?)`,
        [slotId, owner_id, slotTitle, startTime, endTime, 'TBD']
      );

      await pool.execute(
        `INSERT INTO bookings (id, slot_id, user_id, status)
         VALUES (?, ?, ?, 'confirmed')`,
        [bookingId, slotId, request.requester_id]
      );

      notifMessage = 'Your meeting request was accepted and added as an appointment.';
    }

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
  getUserRequests,
  updateMeetingRequest,
};