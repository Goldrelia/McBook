// Authors:
// Derek Long - 261161918

const pool = require('../config/db');

async function getNotifications(req, res) {
  const user_id = req.user.userId;
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [user_id]
    );
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function markAsRead(req, res) {
  const { id } = req.params;
  const user_id = req.user.userId;
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

async function markAllAsRead(req, res) {
  const user_id = req.user.userId;
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [user_id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
