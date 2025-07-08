export const COLOUR_CLASSES = {
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        iconText: '!text-blue-500',
    },
    orange: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        iconText: '!text-orange-500',
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        iconText: '!text-purple-500',
    },
} as const;

export const ICON_SIZES = {
    default: 16,
    small: 14,
    medium: 18,
} as const;

export const EXCLUDED_PATHS = [
    '/',
    '/recent',
    '/settings',
    '/plus',
    '/about',
    '/login',
    '/privacy',
    '/terms',
    '/faq',
] as const;
