// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
// API service for McBook frontend - connects to backend

const API_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('mcbook-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API call helper
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// ==================== AUTHENTICATION ====================
export const login = (email, password) => 
  apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// ==================== SLOTS (Owner) ====================
export const createSlot = (slotData) =>
  apiCall('/slots', {
    method: 'POST',
    body: JSON.stringify(slotData),
  });

export const getOwnerSlots = () => apiCall('/slots');

export const updateSlot = (id, updates) =>
  apiCall(`/slots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const deleteSlot = (id) =>
  apiCall(`/slots/${id}`, { method: 'DELETE' });

export const finalizeGroupSlot = (id, selectedTime, isRecurring, recurrenceWeeks) =>
  apiCall(`/slots/${id}/finalize`, {
    method: 'POST',
    body: JSON.stringify({ 
      selected_time: selectedTime,
      is_recurring: isRecurring,
      recurrence_weeks: recurrenceWeeks 
    }),
  });

// ==================== SLOTS (Student - Browse) ====================
export const browseSlots = () => apiCall('/browse/slots');

export const getSlotByInvite = (token) => 
  apiCall(`/invite/${token}`);

// ==================== BOOKINGS ====================
export const getUserBookings = () => apiCall('/bookings');

export const createBooking = (slotId) =>
  apiCall('/bookings', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  });

export const cancelBooking = (id) =>
  apiCall(`/bookings/${id}`, { method: 'DELETE' });

// ==================== MEETING REQUESTS (Type 1) ====================
export const createMeetingRequest = (ownerId, message) =>
  apiCall('/meeting-requests', {
    method: 'POST',
    body: JSON.stringify({ owner_id: ownerId, message }),
  });

export const getOwnerRequests = () => 
  apiCall('/meeting-requests');

export const updateMeetingRequest = (id, status) =>
  apiCall(`/meeting-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ==================== AVAILABILITY (Type 2 - Group Meetings) ====================
export const submitAvailability = (slotId, selectedTimes) =>
  apiCall('/availability', {
    method: 'POST',
    body: JSON.stringify({ 
      slot_id: slotId, 
      selected_times: selectedTimes 
    }),
  });

export const getAvailability = (slotId) =>
  apiCall(`/availability/${slotId}`);

export const getMyAvailability = (slotId) =>
  apiCall(`/availability/${slotId}/my-votes`);

// ==================== NOTIFICATIONS ====================
export const getNotifications = () => apiCall('/notifications');

export const markNotificationAsRead = (id) =>
  apiCall(`/notifications/${id}`, { method: 'PATCH' });

export const markAllNotificationsAsRead = () =>
  apiCall('/notifications/mark-all-read', { method: 'POST' });
