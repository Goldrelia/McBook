-- Run once on existing DBs: adds group meeting invitee list and finalized flag
USE `comp-307-db`;

ALTER TABLE slots
  ADD COLUMN group_finalized TINYINT(1) NOT NULL DEFAULT 0
  AFTER invite_token;

CREATE TABLE IF NOT EXISTS group_meeting_invitees (
    id VARCHAR(36) PRIMARY KEY,
    slot_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot_invitee (slot_id, email),
    INDEX idx_invitee_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE slots s
INNER JOIN bookings b ON b.slot_id = s.id AND b.status = 'confirmed'
SET s.group_finalized = 1
WHERE s.type = 'group';
