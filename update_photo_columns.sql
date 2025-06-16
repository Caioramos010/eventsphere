-- Increase photo column size in event table to LONGTEXT (up to 4GB)
ALTER TABLE event MODIFY COLUMN photo LONGTEXT;

-- Increase photo column size in user table to LONGTEXT (up to 4GB)
ALTER TABLE user MODIFY COLUMN photo LONGTEXT;
