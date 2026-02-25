import cron from 'node-cron';
import User from '../models/User';

/**
 * Scheduled Tasks for Database Maintenance
 */
export const initCronJobs = () => {
    // ── Daily Expiry Check (Run at 00:00 every day) ──
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily subscription expiry check...');
        try {
            const now = new Date();

            // Find all active pro users whose expiry date has passed
            const result = await User.updateMany(
                {
                    'proSubscription.isActive': true,
                    'proSubscription.expiryDate': { $lt: now }
                },
                {
                    $set: {
                        'proSubscription.isActive': false,
                        'subscriptionStatus': 'free'
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[CRON] Successfully deactivated ${result.modifiedCount} expired subscriptions.`);
            } else {
                console.log('[CRON] No expired subscriptions found today.');
            }
        } catch (error) {
            console.error('[CRON] Error in subscription expiry check:', error);
        }
    });

    console.log('[PRO] Subscription expiry cron job initialized.');
};

// Manually trigger a check (for testing or immediate update)
export const checkExpiriesNow = async () => {
    console.log('[PRO] Manually triggering expiry check...');
    const now = new Date();
    const result = await User.updateMany(
        {
            'proSubscription.isActive': true,
            'proSubscription.expiryDate': { $lt: now }
        },
        {
            $set: {
                'proSubscription.isActive': false,
                'subscriptionStatus': 'free'
            }
        }
    );
    return result.modifiedCount;
};
