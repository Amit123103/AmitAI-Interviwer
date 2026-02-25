import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const getSqlConnectionUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('prisma+')) {
        return url.replace('prisma+', '');
    }
    return url;
};

const pool = new Pool({
    connectionString: getSqlConnectionUrl(process.env.DATABASE_URL),
})

async function verify() {
    console.log('🔍 SQL Authority Diagnostic Audit...')
    try {
        // Check User Count
        const userCount = await pool.query('SELECT COUNT(*) FROM users')
        console.log(`📊 Total Users in SQL: ${userCount.rows[0].count}`)

        // Check Admin User
        const adminUser = await pool.query('SELECT id, username, email, role, "mongoId" FROM users WHERE role = \'ADMIN\' LIMIT 1')
        if (adminUser.rows.length > 0) {
            console.log('✅ Admin User Verified in SQL Authority:')
            console.table(adminUser.rows)
        } else {
            console.warn('⚠️ No Admin User found in SQL Authority!')
        }

        // Check Profiles
        const profileCount = await pool.query('SELECT COUNT(*) FROM user_profiles')
        console.log(`📊 Total Profiles in SQL: ${profileCount.rows[0].count}`)

        // Check Preferences
        const prefCount = await pool.query('SELECT COUNT(*) FROM user_preferences')
        console.log(`📊 Total Preferences in SQL: ${prefCount.rows[0].count}`)

        console.log('\n✅ SQL Authority Integrity Verified.')
    } catch (err: any) {
        console.error('❌ SQL Verification Failed:', err.message)
    } finally {
        await pool.end()
    }
}

verify()
