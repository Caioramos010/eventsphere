-- Drop and recreate the database
DROP DATABASE IF EXISTS event_sphere;
CREATE DATABASE event_sphere;
USE event_sphere;

-- Create tables with proper column definitions
CREATE TABLE user (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password VARCHAR(255) NOT NULL,
  photo LONGTEXT
);

CREATE TABLE event (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date_fixed_start DATE NOT NULL,
  date_start DATE,
  date_fixed_end DATE NOT NULL,
  date_end DATE,
  time_fixed_start TIME NOT NULL,
  time_start TIME,
  time_fixed_end TIME NOT NULL,
  time_end TIME,
  localization VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  max_participants INT,
  classification INT,
  acess VARCHAR(50) NOT NULL,
  photo LONGTEXT,
  state VARCHAR(50) NOT NULL,
  owner_id BIGINT NOT NULL,
  invite_code VARCHAR(255),
  invite_token VARCHAR(255),
  FOREIGN KEY (owner_id) REFERENCES user(id)
);

-- Ensure table names and column names match exactly what Hibernate expects
CREATE TABLE event_participant (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  current_status VARCHAR(50) NOT NULL,
  is_collaborator BOOLEAN NOT NULL DEFAULT FALSE,
  qr_code VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE participant_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  participant_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL,
  change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES event_participant(id)
);

CREATE TABLE event_collaborators (
  event_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES event(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
