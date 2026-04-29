// Authors: Derek Long - 261161918
// Aurelia Bouliane - 261118164

const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner, optionalAuth } = require('../middleware/auth');
const slotsController = require('../controllers/slotsController');
const bookingsController = require('../controllers/bookingsController');
const meetingRequestsController = require('../controllers/meetingRequestsController');
const availabilityController = require('../controllers/availabilityController');
const notificationsController = require('../controllers/notificationsController');

// SLOTS
router.post('/slots', authenticateToken, requireOwner, slotsController.createSlot);
router.get('/slots', authenticateToken, requireOwner, slotsController.getOwnerSlots);
router.get('/slots/:id', authenticateToken, slotsController.getSlotById);
router.get('/slots/:id/options', authenticateToken, slotsController.getSlotOptions);
router.patch('/slots/:id', authenticateToken, requireOwner, slotsController.updateSlot);
router.delete('/slots/:id/series', authenticateToken, requireOwner, slotsController.deleteRecurringSeries);
router.patch('/slots/:id/series/status', authenticateToken, requireOwner, slotsController.updateRecurringSeriesStatus);
router.post(
  '/slots/:id/group-options',
  authenticateToken,
  requireOwner,
  slotsController.addGroupSlotOptions
);
router.delete(
  '/slots/:id/group-options/:optionId',
  authenticateToken,
  requireOwner,
  slotsController.deleteGroupSlotOption
);
router.delete('/slots/:id', authenticateToken, requireOwner, slotsController.deleteSlot);
router.post('/slots/:id/finalize', authenticateToken, requireOwner, slotsController.finalizeGroupSlot);
router.get('/browse/slots', authenticateToken, slotsController.browseSlots);
router.get('/owners', authenticateToken, slotsController.getAllOwners);
router.get(
  '/student/group-polls',
  authenticateToken,
  slotsController.getStudentGroupPolls
);
router.get('/invite/:token', optionalAuth, slotsController.getSlotByInvite);

// VOTING (for group meetings)
router.post('/slots/:token/vote', authenticateToken, availabilityController.submitVote);
router.get('/slots/:token/my-votes', authenticateToken, availabilityController.getMyVotes);

// BOOKINGS
router.get('/bookings', authenticateToken, bookingsController.getUserBookings);
router.post('/bookings', authenticateToken, bookingsController.createBooking);
router.delete('/bookings/:id', authenticateToken, bookingsController.cancelBooking);

// MEETING REQUESTS
router.post('/meeting-requests', authenticateToken, meetingRequestsController.createMeetingRequest);
router.get('/meeting-requests', authenticateToken, requireOwner, meetingRequestsController.getOwnerRequests);
router.get('/meeting-requests/mine', authenticateToken, meetingRequestsController.getUserRequests);
router.patch('/meeting-requests/:id', authenticateToken, requireOwner, meetingRequestsController.updateMeetingRequest);

// NOTIFICATIONS
router.get('/notifications', authenticateToken, notificationsController.getNotifications);
router.patch('/notifications/:id', authenticateToken, notificationsController.markAsRead);
router.post('/notifications/mark-all-read', authenticateToken, notificationsController.markAllAsRead);

module.exports = router;