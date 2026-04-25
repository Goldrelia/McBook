-- Authors:
-- Hooman Azari - 261055604
-- Derek Long - 261161918
-- Aurelia Bouliane - 261118164

-- MySQL Schema for McBook Competition Booking App
CREATE DATABASE IF NOT EXISTS comp307_booking;
USE comp307_booking;

-- USERS
-- role: 'owner' (@mcgill.ca) or 'student' (@mail.mcgill.ca)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SLOTS
-- type:   'request' (Type 1), 'group' (Type 2), 'office_hours' (Type 3)
-- status: 'private' (owner only) or 'active' (visible to all)
CREATE TABLE IF NOT EXISTS slots (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id INT NOT NULL,
    title VARCHAR(255),
    type ENUM('request', 'group', 'office_hours') NOT NULL,
    status ENUM('private', 'active') NOT NULL DEFAULT 'private',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_recurring TINYINT(1) NOT NULL DEFAULT 0,
    recurrence_weeks INT CHECK (recurrence_weeks IS NULL OR recurrence_weeks > 0),
    invite_token VARCHAR(64) UNIQUE,
    location VARCHAR(255) DEFAULT 'TBD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_invite_token (invite_token),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKINGS
-- Links a user to a slot they reserved.
-- status: 'confirmed' or 'cancelled'
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    slot_id VARCHAR(36) NOT NULL,
    user_id INT NOT NULL,
    status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_slot_user (slot_id, user_id),
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_slot_id (slot_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MEETING REQUESTS (Type 1)
-- A user sends a meeting request to an owner.
-- status: 'pending', 'accepted', 'declined'
-- When accepted, a slot + booking row should be created.
CREATE TABLE IF NOT EXISTS meeting_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    requester_id INT NOT NULL,
    owner_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AVAILABILITY RESPONSES (Type 2 — Group Meeting)
-- Each row = one user selecting one available time window.
-- COUNT rows grouped by (slot_id, selected_time) to find
-- the most popular time for the owner to pick.
CREATE TABLE IF NOT EXISTS availability_responses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    slot_id VARCHAR(36) NOT NULL,
    user_id INT NOT NULL,
    selected_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_slot_user_time (slot_id, user_id, selected_time),
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_slot_time (slot_id, selected_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CALENDAR EXPORTS (Required Feature!)
-- Stores OAuth tokens for Google / Outlook calendar sync.
-- provider: 'google' or 'outlook'
CREATE TABLE IF NOT EXISTS calendar_exports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL,
    provider ENUM('google', 'outlook') NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_provider (user_id, provider),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTIFICATIONS
-- In-app notifications for slot deletions, cancellations, etc.
-- type: 'slot_deleted', 'booking_cancelled', 'request_accepted', etc.
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;