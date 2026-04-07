-- Authors:
-- Hooman Azari - 261055604
-- Derek Long - 261161918
PRAGMA foreign_keys = ON;

CREATE DATABASE IF NOT EXISTS comp307_booking;
USE comp307_booking;

-- USERS
-- role: 'owner' (@mcgill.ca) or 'user' (@mail.mcgill.ca)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- SLOTS
-- type:   'request' (Type 1), 'group' (Type 2), 'office_hours' (Type 3)
-- status: 'private' (owner only) or 'active' (visible to all)
CREATE TABLE IF NOT EXISTS slots (
    id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT,
    type             TEXT NOT NULL CHECK (type IN ('request', 'group', 'office_hours')),
    status           TEXT NOT NULL DEFAULT 'private' CHECK (status IN ('private', 'active')),
    start_time       TEXT NOT NULL,
    end_time         TEXT NOT NULL,
    is_recurring     INTEGER NOT NULL DEFAULT 0,
    recurrence_weeks INTEGER CHECK (recurrence_weeks > 0),
    invite_token     TEXT UNIQUE,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- BOOKINGS
-- Links a user to a slot they reserved.
-- status: 'confirmed' or 'cancelled'
CREATE TABLE IF NOT EXISTS bookings (
    id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    slot_id   TEXT NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status    TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    booked_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (slot_id, user_id)
);

-- MEETING REQUESTS (Type 1)
-- A user sends a meeting request to an owner.
-- status: 'pending', 'accepted', 'declined'
-- When accepted, a slot + booking row should be created.
CREATE TABLE IF NOT EXISTS meeting_requests (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      TEXT,
    status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AVAILABILITY RESPONSES (Type 2 — Group Meeting)
-- Each row = one user selecting one available time window.
-- COUNT rows grouped by (slot_id, selected_time) to find
-- the most popular time for the owner to pick.
CREATE TABLE IF NOT EXISTS availability_responses (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    slot_id       TEXT NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_time TEXT NOT NULL,
    UNIQUE (slot_id, user_id, selected_time)
);

-- CALENDAR EXPORTS (Bonus Feature)
-- Stores OAuth tokens for Google / Outlook calendar sync.
-- provider: 'google' or 'outlook'
CREATE TABLE IF NOT EXISTS calendar_exports (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider      TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
    access_token  TEXT NOT NULL,
    refresh_token TEXT,
    expires_at    TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, provider)
);

-- NOTIFICATIONS
-- In-app notifications for slot deletions, cancellations, etc.
-- type: 'slot_deleted', 'booking_cancelled', 'request_accepted', etc.
CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_slots_owner_id     ON slots(owner_id);
CREATE INDEX IF NOT EXISTS idx_slots_status        ON slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id    ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner_id   ON meeting_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_avail_slot_time     ON availability_responses(slot_id, selected_time);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread   ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_slots_invite_token  ON slots(invite_token);