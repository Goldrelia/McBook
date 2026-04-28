-- Hooman Azari - 261055604
-- Adds per-user calendar subscription token used by calendar feed endpoints.
USE `comp-307-db`;

ALTER TABLE users
  ADD COLUMN calendar_feed_token VARCHAR(64) UNIQUE DEFAULT NULL
  AFTER role;
