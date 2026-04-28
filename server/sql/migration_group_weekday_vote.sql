-- Hooman Azari - 261055604
-- Type 2: students vote on weekday+time alternatives (not every date in a range).
-- Optional season window on the group slot; vote options may use weekday only (option_date NULL).

USE `comp-307-db`;

ALTER TABLE slots
  ADD COLUMN group_season_start DATE NULL DEFAULT NULL AFTER group_finalized,
  ADD COLUMN group_season_end DATE NULL DEFAULT NULL AFTER group_season_start;

ALTER TABLE group_slot_options
  ADD COLUMN weekday TINYINT NULL DEFAULT NULL COMMENT '0=Sun..6=Sat; NULL with option_date = legacy calendar option' AFTER end_time,
  MODIFY option_date DATE NULL;
