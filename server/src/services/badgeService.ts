import { IUser } from '../models/User';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export const BADGES: Record<string, Badge> = {
    first_step: { id: 'first_step', name: 'First Step', description: 'Completed your first interview', icon: 'footprints' },
    hat_trick: { id: 'hat_trick', name: 'Hat Trick', description: 'Achieved a 3-day streak', icon: 'flame' },
    on_fire: { id: 'on_fire', name: 'On Fire', description: 'Achieved a 7-day streak', icon: 'zap' },
    marathon: { id: 'marathon', name: 'Marathoner', description: 'Completed 10 interviews', icon: 'trophy' },
    code_ninja: { id: 'code_ninja', name: 'Code Ninja', description: 'Wrote over 1000 lines of code', icon: 'code' },
    night_owl: { id: 'night_owl', name: 'Night Owl', description: 'Completed an interview after 10 PM', icon: 'moon' },
    early_bird: { id: 'early_bird', name: 'Early Bird', description: 'Completed an interview before 8 AM', icon: 'sun' },
    integrity_master: { id: 'integrity_master', name: 'Saint', description: '100% Integrity Score in a session', icon: 'shield' },
    social_butterfly: { id: 'social_butterfly', name: 'Social Butterfly', description: 'Participated in a Peer Interview', icon: 'users' },
    negotiator: { id: 'negotiator', name: 'Deal Maker', description: 'Successfully negotiated an offer', icon: 'briefcase' }
};

export const checkBadges = (user: IUser, context: any = {}): any[] => {
    const newBadges: any[] = [];
    const now = new Date();

    const award = (badgeId: string) => {
        if (!user.achievements.find(a => a.id === badgeId)) {
            const badge = BADGES[badgeId];
            if (badge) {
                const achievement = { ...badge, unlockedAt: now };
                user.achievements.push(achievement);
                newBadges.push(achievement);
            }
        }
    };

    // --- Streak Badges ---
    if (user.streak >= 3) award('hat_trick');
    if (user.streak >= 7) award('on_fire');

    // --- Count Badges ---
    if (user.stats.totalInterviews >= 1) award('first_step');
    if (user.stats.totalInterviews >= 10) award('marathon');
    if (user.stats.totalCodeLines >= 1000) award('code_ninja');

    // --- Context Specific Badges ---
    // Time based
    if (context.timestamp) {
        const hour = new Date(context.timestamp).getHours();
        if (hour >= 22) award('night_owl');
        if (hour < 8) award('early_bird');
    }

    // Performance based
    if (context.integrityScore === 100) award('integrity_master');
    if (context.type === 'peer') award('social_butterfly');
    if (context.type === 'negotiation_success') award('negotiator');

    return newBadges;
};
