-- =============================================
-- HRMS Database Initialization
-- Run on first startup via docker-entrypoint-initdb.d
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create app role for RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hrms_app') THEN
    CREATE ROLE hrms_app;
  END IF;
END $$;

-- Grant connect to app role
GRANT CONNECT ON DATABASE hrms TO hrms_app;
GRANT USAGE ON SCHEMA public TO hrms_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hrms_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO hrms_app;
