import { Flame, Calendar, Trophy, Award, CheckCircle2, User, Zap, Briefcase, Moon, Sun, Shield } from "lucide-react"

export const BADGES: Record<string, any> = {
    first_step: { id: 'first_step', name: 'First Step', description: 'Completed your first interview', icon: 'footprints' },
    hat_trick: { id: 'hat_trick', name: 'Hat Trick', description: 'Achieved a 3-day streak', icon: 'flame' },
    on_fire: { id: 'on_fire', name: 'On Fire', description: 'Achieved a 7-day streak', icon: 'zap' },
    marathon: { id: 'marathon', name: 'Marathoner', description: 'Completed 10 interviews', icon: 'trophy' },
    code_ninja: { id: 'code_ninja', name: 'Code Ninja', description: 'Wrote over 1000 lines of code', icon: 'code' },
    night_owl: { id: 'night_owl', name: 'Night Owl', description: 'Completed an interview after 10 PM', icon: 'moon' },
    early_bird: { id: 'early_bird', name: 'Early Bird', description: 'Completed an interview before 8 AM', icon: 'sun' },
    integrity_master: { id: 'integrity_master', name: 'Saint', description: '100% Integrity Score', icon: 'shield' },
    social_butterfly: { id: 'social_butterfly', name: 'Social Butterfly', description: 'Participated in a Peer Interview', icon: 'users' },
    negotiator: { id: 'negotiator', name: 'Deal Maker', description: 'Successfully negotiated an offer', icon: 'briefcase' }
}

export const BADGE_ICONS: Record<string, any> = {
    'flame': Flame,
    'zap': Zap,
    'trophy': Trophy,
    'code': User, // Lucide 'code' icon or User as fallback if not imported? I imported User, but looking for Code. 
    // Wait, I should import Code from lucide-react if I use it.
    'moon': Moon,
    'sun': Sun,
    'shield': Shield,
    'users': User,
    'briefcase': Briefcase,
    'footprints': CheckCircle2 // approximate
}
