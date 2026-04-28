// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
// API service for McBook frontend - connects to backend

export const API_URL = import.meta.env.VITE_API_URL || '/api';

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

  if (response.status === 204) {
    return {};
  }

  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
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

export const deleteSlotSeries = (id) =>
  apiCall(`/slots/${id}/series`, { method: 'DELETE' });

/** Pass an array of { date, start_time, end_time } or a body object (e.g. weekly expand fields). */
export const addGroupPollOptions = (slotId, payload) =>
  apiCall(`/slots/${slotId}/group-options`, {
    method: 'POST',
    body: JSON.stringify(
      Array.isArray(payload) ? { group_slot_options: payload } : payload
    ),
  });

export const deleteGroupPollOption = (slotId, optionId) =>
  apiCall(`/slots/${slotId}/group-options/${optionId}`, { method: 'DELETE' });

// ==================== SLOTS (Student - Browse) ====================
export const browseSlots = () => apiCall('/browse/slots');

/** Group meeting polls you are invited to (not yet finalized) */
export const getStudentGroupPolls = () => apiCall('/student/group-polls');

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

export const getMyMeetingRequests = () =>
  apiCall('/meeting-requests/mine');

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

// ==================== GROUP SLOT OPTIONS & VOTING ====================
 
// Get voting options for a group slot
export const getSlotOptions = (slotId) => 
  apiCall(`/slots/${slotId}/options`);
 
// Submit votes for a group meeting (by invite token)
export const submitVote = (token, selectedOptionIds) =>
  apiCall(`/slots/${token}/vote`, {
    method: 'POST',
    body: JSON.stringify({ selected_option_ids: selectedOptionIds }),
  });
 
// Get user's current votes for a group meeting
export const getMyVotes = (token) =>
  apiCall(`/slots/${token}/my-votes`);
 
// Finalize a group meeting (owner selects winning option)
export const finalizeGroupMeeting = (slotId, selectedOptionId, isRecurring, recurrenceWeeks) =>
  apiCall(`/slots/${slotId}/finalize`, {
    method: 'POST',
    body: JSON.stringify({
      selected_option_id: selectedOptionId,
      is_recurring: isRecurring,
      recurrence_weeks: recurrenceWeeks
    }),
  });
