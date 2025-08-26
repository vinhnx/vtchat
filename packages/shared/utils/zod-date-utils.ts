import { z } from 'zod';

/**
 * Utility functions for handling Zod date transformations
 * These help with mapping between string dates (what models return)
 * and JavaScript Date objects (what the application uses)
 */

/**
 * Zod schema for date strings that transforms to JavaScript Date objects
 * Use this for date fields in your schemas when you need actual Date objects
 */
export const dateStringToDate = z
    .string()
    .date()
    .transform((value) => new Date(value));

/**
 * Zod schema for datetime strings that transforms to JavaScript Date objects
 * Use this for datetime fields in your schemas when you need actual Date objects
 */
export const datetimeStringToDate = z
    .string()
    .datetime()
    .transform((value) => new Date(value));

/**
 * Example usage in a schema:
 *
 * const userSchema = z.object({
 *   name: z.string(),
 *   birthDate: dateStringToDate, // Will be a Date object after parsing
 *   lastLogin: datetimeStringToDate, // Will be a Date object after parsing
 * });
 *
 * const result = userSchema.parse({
 *   name: "John Doe",
 *   birthDate: "1990-01-01",
 *   lastLogin: "2023-01-01T10:00:00Z"
 * });
 *
 *  // true
 *  // true
 */

/**
 * Helper function to create a schema for date ranges
 * Useful for filtering data by date ranges
 */
export const dateRangeSchema = z.object({
    startDate: dateStringToDate,
    endDate: dateStringToDate,
});

/**
 * Helper function to create a schema for datetime ranges
 * Useful for filtering data by datetime ranges
 */
export const datetimeRangeSchema = z.object({
    startDateTime: datetimeStringToDate,
    endDateTime: datetimeStringToDate,
});

/**
 * Utility function to format a Date object to a date string for API responses
 * Ensures consistent formatting across the application
 */
export const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Utility function to format a Date object to a datetime string for API responses
 * Ensures consistent formatting across the application
 */
export const formatDateTimeToString = (date: Date): string => {
    return date.toISOString();
};
