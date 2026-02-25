import mongoose from 'mongoose'
import { Pool } from 'pg'
import User from '../src/models/User'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function migrate() {
    console.log('🚀 Starting Student Migration [RAW SQL]: Mongo -> SQL Authority...')

    try {
        await mongoose.connect(process.env.MONGO_URI || '')
        console.log('✅ Connected to MongoDB.')

        const mongoUsers = await User.find({}).lean()
        console.log(`📊 Found ${mongoUsers.length} students to migrate.`)

        for (const user of mongoUsers) {
            console.log(`🔄 Migrating: ${user.username} (${user.email})...`)

            try {
                // Upsert into users table
                const upsertUserQuery = `
                    INSERT INTO "users" ("mongoId", username, email, "passwordHash", role, "accountStatus", xp, level, streak, "maxStreak", "subscriptionStatus", "createdAt", "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (email) DO UPDATE SET
                        "mongoId" = EXCLUDED."mongoId",
                        username = EXCLUDED.username,
                        "passwordHash" = EXCLUDED."passwordHash",
                        role = EXCLUDED.role,
                        "accountStatus" = EXCLUDED."accountStatus",
                        xp = EXCLUDED.xp,
                        level = EXCLUDED.level,
                        streak = EXCLUDED.streak,
                        "maxStreak" = EXCLUDED."maxStreak",
                        "subscriptionStatus" = EXCLUDED."subscriptionStatus",
                        "updatedAt" = NOW()
                    RETURNING id;
                `

                const roleMapping = (user.role === 'admin' ? 'ADMIN' : (user.role === 'sub-admin' ? 'SUB_ADMIN' : 'STUDENT'))
                const statusMapping = (user.accountStatus === 'suspended' ? 'SUSPENDED' : 'ACTIVE')
                const subMapping = (user.subscriptionStatus === 'pro' ? 'MONTHLY' : 'FREE')

                const userRes = await pool.query(upsertUserQuery, [
                    user._id.toString(),
                    user.username,
                    user.email,
                    user.passwordHash,
                    roleMapping,
                    statusMapping,
                    user.xp || 0,
                    user.level || 1,
                    user.streak || 0,
                    user.maxStreak || 0,
                    subMapping,
                    user.createdAt || new Date(),
                    new Date()
                ])

                const sqlUserId = userRes.rows[0].id

                // Upsert Profile
                if (user.stats) {
                    await pool.query(`
                        INSERT INTO "user_profiles" ("userId", "totalInterviews", "totalCodeLines", "averageScore")
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT ("userId") DO UPDATE SET
                            "totalInterviews" = EXCLUDED."totalInterviews",
                            "totalCodeLines" = EXCLUDED."totalCodeLines",
                            "averageScore" = EXCLUDED."averageScore";
                    `, [
                        sqlUserId,
                        user.stats.totalInterviews || 0,
                        user.stats.totalCodeLines || 0,
                        user.stats.averageScore || 0
                    ])
                }

                // Upsert Preferences
                if (user.preferences) {
                    await pool.query(`
                        INSERT INTO "user_preferences" ("userId", "defaultVoice", "defaultDifficulty", "defaultQuestionCount", language, theme)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT ("userId") DO UPDATE SET
                            "defaultVoice" = EXCLUDED."defaultVoice",
                            "defaultDifficulty" = EXCLUDED."defaultDifficulty",
                            "defaultQuestionCount" = EXCLUDED."defaultQuestionCount",
                            language = EXCLUDED.language,
                            theme = EXCLUDED.theme;
                    `, [
                        sqlUserId,
                        user.preferences.defaultVoice || 'Female (Alloy)',
                        user.preferences.defaultDifficulty || 'Intermediate',
                        user.preferences.defaultQuestionCount || 10,
                        user.preferences.language || 'English',
                        user.preferences.theme || 'dark'
                    ])
                }

                process.stdout.write('✓ ')
            } catch (err: any) {
                console.error(`\n❌ Failed to migrate user ${user.email}:`, err.message)
            }
        }

        console.log('\n\n✅ Student Migration Complete.')
    } catch (err: any) {
        console.error('❌ Migration Error:', err.message)
    } finally {
        await mongoose.disconnect()
        await pool.end()
        process.exit(0)
    }
}

migrate()
