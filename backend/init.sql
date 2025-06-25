-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Grant necessary permissions to the user
GRANT ALL PRIVILEGES ON DATABASE grammar_anatomy TO postgres;

-- Additional setup can be added here as needed