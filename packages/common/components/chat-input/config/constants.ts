export const COLOUR_CLASSES = {
    blue: {
        bg: 'bg-blue-600 dark:bg-blue-200',
        text: 'text-blue-800 dark:text-blue-200',
        iconText: '!text-blue-800 dark:!text-blue-200',
        border: 'border-blue-500/40 dark:border-blue-500/50',
    },
    orange: {
        bg: 'bg-orange-600 dark:bg-orange-200',
        text: 'text-orange-800 dark:text-orange-200',
        iconText: '!text-orange-800 dark:!text-orange-200',
        border: 'border-orange-500/40 dark:border-orange-500/50',
    },
    purple: {
        bg: 'bg-purple-600 dark:bg-purple-200',
        text: 'text-purple-800 dark:text-purple-200',
        iconText: '!text-purple-800 dark:!text-purple-200',
        border: 'border-purple-500/40 dark:border-purple-500/50',
    },
} as const;

export const ICON_SIZES = {
    default: 16,
    small: 14,
    medium: 18,
} as const;

export const EXCLUDED_PATHS = [
    '/',
    '/settings',
    '/pricing',
    '/about',
    '/login',
    '/privacy',
    '/terms',
    '/help',
] as const;
