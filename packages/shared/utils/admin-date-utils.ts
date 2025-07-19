/**
 * Utility functions for common date calculations used in admin analytics
 * Provides consistent date handling across admin routes
 */

export interface AdminDateRanges {
    now: Date;
    oneDayAgo: Date;
    sevenDaysAgo: Date;
    thirtyDaysAgo: Date;
}

/**
 * Get standard date ranges used in admin analytics
 * @param baseDate - Base date to calculate from (defaults to now)
 * @returns Object with common date ranges
 */
export function getAdminDateRanges(baseDate?: Date): AdminDateRanges {
    const now = baseDate || new Date();
    
    return {
        now,
        oneDayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        sevenDaysAgo: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        thirtyDaysAgo: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
}

/**
 * Get a date N days ago from the base date
 * @param days - Number of days to go back
 * @param baseDate - Base date to calculate from (defaults to now)
 * @returns Date N days ago
 */
export function getDaysAgo(days: number, baseDate?: Date): Date {
    const now = baseDate || new Date();
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Get a date N hours ago from the base date
 * @param hours - Number of hours to go back
 * @param baseDate - Base date to calculate from (defaults to now)
 * @returns Date N hours ago
 */
export function getHoursAgo(hours: number, baseDate?: Date): Date {
    const now = baseDate || new Date();
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

/**
 * Get a date N minutes ago from the base date
 * @param minutes - Number of minutes to go back
 * @param baseDate - Base date to calculate from (defaults to now)
 * @returns Date N minutes ago
 */
export function getMinutesAgo(minutes: number, baseDate?: Date): Date {
    const now = baseDate || new Date();
    return new Date(now.getTime() - minutes * 60 * 1000);
}

/**
 * Common date ranges for different analytics periods
 */
export const AdminDatePresets = {
    /**
     * Get date ranges for real-time analytics (last hour, 6 hours, 24 hours)
     */
    getRealTimeRanges: (baseDate?: Date) => {
        const now = baseDate || new Date();
        return {
            now,
            oneHourAgo: getHoursAgo(1, now),
            sixHoursAgo: getHoursAgo(6, now),
            oneDayAgo: getDaysAgo(1, now),
        };
    },

    /**
     * Get date ranges for weekly analytics (1, 7, 14, 30 days)
     */
    getWeeklyRanges: (baseDate?: Date) => {
        const now = baseDate || new Date();
        return {
            now,
            oneDayAgo: getDaysAgo(1, now),
            sevenDaysAgo: getDaysAgo(7, now),
            fourteenDaysAgo: getDaysAgo(14, now),
            thirtyDaysAgo: getDaysAgo(30, now),
        };
    },

    /**
     * Get date ranges for monthly analytics (30, 60, 90 days)
     */
    getMonthlyRanges: (baseDate?: Date) => {
        const now = baseDate || new Date();
        return {
            now,
            thirtyDaysAgo: getDaysAgo(30, now),
            sixtyDaysAgo: getDaysAgo(60, now),
            ninetyDaysAgo: getDaysAgo(90, now),
        };
    },
} as const;

/**
 * Format date for SQL queries (ISO string)
 * @param date - Date to format
 * @returns ISO string representation
 */
export function formatDateForSQL(date: Date): string {
    return date.toISOString();
}

/**
 * Format date for display in admin UI
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateForDisplay(
    date: Date,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    },
): string {
    return new Intl.DateTimeFormat("en-US", options).format(date);
}
