import { dateStringToDate, datetimeStringToDate } from '@repo/shared/utils/zod-date-utils';
import { z } from 'zod';

/**
 * Example schemas demonstrating best practices for date handling with Zod
 * These can be used as references when creating new schemas
 */

/**
 * Event schema with both date and datetime fields
 */
export const EventSchema = z.object({
    id: z.string().describe('Unique identifier for the event'),
    title: z.string().describe('Event title'),
    description: z.string().optional().describe('Event description'),
    startDate: dateStringToDate.describe('Event start date'),
    endDate: dateStringToDate.describe('Event end date'),
    createdAt: datetimeStringToDate.describe('When the event was created'),
    updatedAt: datetimeStringToDate.describe('When the event was last updated'),
});

/**
 * User profile schema with date of birth
 */
export const UserProfileSchema = z.object({
    id: z.string().describe('Unique identifier for the user'),
    name: z.string().describe("User's full name"),
    email: z.string().email().describe("User's email address"),
    dateOfBirth: dateStringToDate.describe("User's date of birth"),
    createdAt: datetimeStringToDate.describe('When the user profile was created'),
    lastLoginAt: datetimeStringToDate.nullable().describe('When the user last logged in'),
});

/**
 * API response schema with date fields
 */
export const ApiResponseSchema = z.object({
    success: z.boolean().describe('Whether the API call was successful'),
    data: z.object({
        id: z.string(),
        name: z.string(),
        createdAt: datetimeStringToDate,
        updatedAt: datetimeStringToDate,
    }).nullable().describe('The response data, if successful'),
    error: z.string().nullable().describe('Error message, if unsuccessful'),
    timestamp: datetimeStringToDate.describe('When the response was generated'),
});

/**
 * Example usage:
 *
 * // Parsing data from an API response
 * const eventData = {
 *   id: "123",
 *   title: "Team Meeting",
 *   startDate: "2023-06-15",
 *   endDate: "2023-06-15",
 *   createdAt: "2023-06-01T09:00:00Z",
 *   updatedAt: "2023-06-01T09:00:00Z"
 * };
 *
 * const parsedEvent = EventSchema.parse(eventData);
 *  // true
 *
 * // Preparing data for an API request
 * const newEvent = {
 *   title: "Project Launch",
 *   startDate: new Date("2023-07-01"),
 *   endDate: new Date("2023-07-01"),
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 *
 * // When sending to API, convert dates back to strings
 * const apiPayload = {
 *   ...newEvent,
 *   startDate: newEvent.startDate.toISOString().split('T')[0],
 *   endDate: newEvent.endDate.toISOString().split('T')[0],
 *   createdAt: newEvent.createdAt.toISOString(),
 *   updatedAt: newEvent.updatedAt.toISOString(),
 * };
 */
