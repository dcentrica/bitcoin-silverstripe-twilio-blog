--
-- Create DB
--
CREATE DATABASE IF NOT EXISTS twilio;

--
-- Grant access
--
GRANT ALL ON twilio.* TO 'twilio'@'db' IDENTIFIED BY 'twilio';
FLUSH PRIVILEGES;

