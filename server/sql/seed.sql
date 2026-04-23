-- McBook Seed Data
-- Authors: Hooman Azari - 261055604
-- Aurelia Bouliane - 261118164
-- Test data for development and demo

USE comp307_booking;

-- Clear existing data (in reverse order of foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE availability_responses;
TRUNCATE TABLE meeting_requests;
TRUNCATE TABLE bookings;
TRUNCATE TABLE slots;
TRUNCATE TABLE users;
TRUNCATE TABLE calendar_exports;
SET FOREIGN_KEY_CHECKS = 1;

-- ==================== USERS ====================
-- Password for all users: "password123"
-- Bcrypt hash: $2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu

INSERT INTO users (id, email, password_hash, role) VALUES
-- Owners (Professors/TAs)
(1, 'prof.smith@mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'owner'),
(2, 'ta.jones@mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'owner'),
(3, 'prof.chen@mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'owner'),

-- Students
(4, 'alice.wang@mail.mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'student'),
(5, 'bob.martin@mail.mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'student'),
(6, 'carol.lee@mail.mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'student'),
(7, 'david.brown@mail.mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'student'),
(8, 'emma.wilson@mail.mcgill.ca', '$2b$10$X928AMuF.aMrHvC/eflfWueOUu01GkzVToVf4R5XIWIMm.zruFYSu', 'student');

-- ==================== SLOTS ====================
INSERT INTO slots (id, owner_id, title, type, status, start_time, end_time, is_recurring, recurrence_weeks, invite_token) VALUES
-- Office Hours (Type 3)
('550e8400-e29b-41d4-a716-446655440001', 1, 'COMP 307 Office Hours', 'office_hours', 'active', '2024-12-20 14:00:00', '2024-12-20 15:00:00', 1, 12, NULL),
('550e8400-e29b-41d4-a716-446655440002', 1, 'COMP 307 Extra Help Session', 'office_hours', 'active', '2024-12-22 10:00:00', '2024-12-22 11:30:00', 0, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440003', 2, 'Tutorial Session - Week 12', 'office_hours', 'active', '2024-12-21 15:00:00', '2024-12-21 16:00:00', 0, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440004', 3, 'COMP 250 Drop-in Hours', 'office_hours', 'active', '2024-12-23 13:00:00', '2024-12-23 14:00:00', 1, 8, NULL),

-- Group Meetings (Type 2) - Some finalized, some still voting
('550e8400-e29b-41d4-a716-446655440005', 1, 'Final Project Team Meeting', 'group', 'active', '2024-12-28 16:00:00', '2024-12-28 17:00:00', 0, NULL, 'invite-token-abc123'),
('550e8400-e29b-41d4-a716-446655440006', 2, 'Study Group - Midterm Prep', 'group', 'active', '2024-12-27 18:00:00', '2024-12-27 20:00:00', 0, NULL, 'invite-token-def456'),
('550e8400-e29b-41d4-a716-446655440007', 3, 'Research Group Sync', 'group', 'private', '2024-12-30 14:00:00', '2024-12-30 15:00:00', 0, NULL, 'invite-token-ghi789'),

-- Private/Draft slots
('550e8400-e29b-41d4-a716-446655440008', 1, 'Thesis Defense Practice', 'office_hours', 'private', '2024-12-29 10:00:00', '2024-12-29 11:00:00', 0, NULL, NULL);

-- ==================== BOOKINGS ====================
INSERT INTO bookings (id, slot_id, user_id, status) VALUES
-- Office hours bookings
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 4, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 5, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 6, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 4, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 7, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 5, 'confirmed'),

-- Group meeting bookings (finalized)
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 4, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 5, 'confirmed'),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 6, 'confirmed'),

-- Cancelled booking (for testing)
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 8, 'cancelled');

-- ==================== MEETING REQUESTS (Type 1) ====================
INSERT INTO meeting_requests (id, requester_id, owner_id, message, status) VALUES
('750e8400-e29b-41d4-a716-446655440001', 4, 1, 'Hi Prof. Smith, I would like to discuss my final project proposal. Are you available this week?', 'pending'),
('750e8400-e29b-41d4-a716-446655440002', 5, 1, 'Could we meet to go over the assignment 3 feedback? I have some questions.', 'accepted'),
('750e8400-e29b-41d4-a716-446655440003', 6, 2, 'I need help understanding graph algorithms. Can we schedule a meeting?', 'pending'),
('750e8400-e29b-41d4-a716-446655440004', 7, 3, 'Would you be available for a quick chat about graduate school applications?', 'declined'),
('750e8400-e29b-41d4-a716-446655440005', 8, 2, 'Can we discuss my project timeline? I think I might need an extension.', 'pending');

-- ==================== AVAILABILITY RESPONSES (Type 2 - Group Voting) ====================
-- For slot '550e8400-e29b-41d4-a716-446655440006' (Study Group - Midterm Prep)
-- Students voting on different times
INSERT INTO availability_responses (id, slot_id, user_id, selected_time) VALUES
-- Alice's availability (3 time slots)
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 4, '2024-12-27 18:00:00'),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 4, '2024-12-27 19:00:00'),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 4, '2024-12-28 14:00:00'),

-- Bob's availability (2 time slots)
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 5, '2024-12-27 18:00:00'),
('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 5, '2024-12-28 14:00:00'),

-- Carol's availability (2 time slots)
('850e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 6, '2024-12-27 18:00:00'),
('850e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 6, '2024-12-27 20:00:00'),

-- David's availability (3 time slots)
('850e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', 7, '2024-12-27 18:00:00'),
('850e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', 7, '2024-12-27 19:00:00'),
('850e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', 7, '2024-12-28 14:00:00');
-- Most popular time: 2024-12-27 18:00:00 (4 votes)

-- ==================== NOTIFICATIONS ====================
INSERT INTO notifications (id, user_id, type, message, is_read) VALUES
-- For owners
('950e8400-e29b-41d4-a716-446655440001', 1, 'new_booking', 'Alice Wang booked your "COMP 307 Office Hours" slot', 0),
('950e8400-e29b-41d4-a716-446655440002', 1, 'meeting_request', 'New meeting request from Alice Wang', 0),
('950e8400-e29b-41d4-a716-446655440003', 2, 'new_booking', 'Carol Lee booked your "Tutorial Session - Week 12"', 1),

-- For students
('950e8400-e29b-41d4-a716-446655440004', 4, 'booking_confirmed', 'Your booking for "COMP 307 Office Hours" is confirmed', 1),
('950e8400-e29b-41d4-a716-446655440005', 5, 'request_accepted', 'Prof. Smith accepted your meeting request!', 0),
('950e8400-e29b-41d4-a716-446655440006', 6, 'group_finalized', 'Group meeting "Final Project Team Meeting" has been finalized!', 0),
('950e8400-e29b-41d4-a716-446655440007', 7, 'request_declined', 'Your meeting request to Prof. Chen was declined', 1),
('950e8400-e29b-41d4-a716-446655440008', 8, 'booking_cancelled', 'Your booking for "COMP 307 Extra Help" was cancelled', 1);

-- ==================== SUCCESS MESSAGE ====================
SELECT 'Seed data inserted successfully!' AS Status;
SELECT 
  (SELECT COUNT(*) FROM users) AS Users,
  (SELECT COUNT(*) FROM slots) AS Slots,
  (SELECT COUNT(*) FROM bookings) AS Bookings,
  (SELECT COUNT(*) FROM meeting_requests) AS Requests,
  (SELECT COUNT(*) FROM availability_responses) AS Votes,
  (SELECT COUNT(*) FROM notifications) AS Notifications;