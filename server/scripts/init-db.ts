import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Attempt to parse standard PG URL from Prisma URL if necessary
// (Prisma local dev URLs often wrap the real one)
let connectionString = process.env.DATABASE_URL
if (connectionString?.startsWith('prisma+')) {
    // This is a heuristic: if it's a prisma+postgres URL, we might need 
    // to provide the user a way to specify a standard postgres:// URL.
    // For now, we'll assume the environment has established the proxy.
}

const pool = new Pool({
    connectionString: connectionString,
})

const schema = `
-- Authority Schema Initialization
-- Support for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types with existence checks
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN', 'SUB_ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountStatus') THEN
        CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionPlan') THEN
        CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'MONTHLY', 'SIX_MONTH', 'YEARLY');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "mongoId" TEXT UNIQUE,
    "username" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" DEFAULT 'STUDENT',
    "accountStatus" "AccountStatus" DEFAULT 'ACTIVE',
    "xp" INTEGER DEFAULT 0,
    "level" INTEGER DEFAULT 1,
    "streak" INTEGER DEFAULT 0,
    "maxStreak" INTEGER DEFAULT 0,
    "subscriptionStatus" "SubscriptionPlan" DEFAULT 'FREE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ensure mongoId exists even if table was already there
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mongoId" TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "totalInterviews" INTEGER DEFAULT 0,
    "totalCodeLines" INTEGER DEFAULT 0,
    "averageScore" DOUBLE PRECISION DEFAULT 0,
    "achievements" JSONB,
    "dailyMissions" JSONB,
    "weeklyGoal" JSONB
);

CREATE TABLE IF NOT EXISTS "user_preferences" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "defaultVoice" TEXT DEFAULT 'Female (Alloy)',
    "defaultDifficulty" TEXT DEFAULT 'Intermediate',
    "defaultQuestionCount" INTEGER DEFAULT 10,
    "language" TEXT DEFAULT 'English',
    "theme" TEXT DEFAULT 'dark',
    "accentColor" TEXT DEFAULT '#10b981',
    "emailNotifications" BOOLEAN DEFAULT true,
    "reminderNotifications" BOOLEAN DEFAULT true,
    "updateNotifications" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "admin_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "adminId" UUID NOT NULL REFERENCES "users"("id"),
    "adminName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "targetName" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "announcements" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT DEFAULT 'medium',
    "audience" TEXT DEFAULT 'all',
    "createdBy" UUID NOT NULL REFERENCES "users"("id"),
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "resources" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isProOnly" BOOLEAN DEFAULT false,
    "createdBy" UUID NOT NULL REFERENCES "users"("id"),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "upgrade_requests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id"),
    "requestedPlan" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
`

async function init() {
    console.log('🚀 Initiating SQL Authority Schema Deployment...')
    try {
        await pool.query(schema)
        console.log('✅ Schema Depolyment Successful.')
    } catch (err: any) {
        console.error('❌ Deployment Failed:', err.stack || err.message)
    } finally {
        await pool.end()
    }
}

init()
