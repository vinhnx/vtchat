import { describe, expect, it, beforeEach } from "vitest";
import {
    getAdminDateRanges,
    getDaysAgo,
    getHoursAgo,
    getMinutesAgo,
    AdminDatePresets,
    formatDateForSQL,
    formatDateForDisplay,
} from "@repo/shared/utils/admin-date-utils";

describe("Admin Date Utils", () => {
    let fixedDate: Date;

    beforeEach(() => {
        // Use a fixed date for consistent testing
        fixedDate = new Date("2024-01-15T12:00:00.000Z");
    });

    describe("getAdminDateRanges", () => {
        it("should return correct date ranges with default base date", () => {
            const ranges = getAdminDateRanges(fixedDate);

            expect(ranges.now).toEqual(fixedDate);
            expect(ranges.oneDayAgo).toEqual(new Date("2024-01-14T12:00:00.000Z"));
            expect(ranges.sevenDaysAgo).toEqual(new Date("2024-01-08T12:00:00.000Z"));
            expect(ranges.thirtyDaysAgo).toEqual(new Date("2023-12-16T12:00:00.000Z"));
        });

        it("should use current date when no base date provided", () => {
            const ranges = getAdminDateRanges();
            const now = new Date();
            
            // Allow for small time differences in test execution
            expect(Math.abs(ranges.now.getTime() - now.getTime())).toBeLessThan(1000);
        });
    });

    describe("getDaysAgo", () => {
        it("should calculate correct date N days ago", () => {
            expect(getDaysAgo(1, fixedDate)).toEqual(new Date("2024-01-14T12:00:00.000Z"));
            expect(getDaysAgo(7, fixedDate)).toEqual(new Date("2024-01-08T12:00:00.000Z"));
            expect(getDaysAgo(30, fixedDate)).toEqual(new Date("2023-12-16T12:00:00.000Z"));
        });

        it("should handle zero days", () => {
            expect(getDaysAgo(0, fixedDate)).toEqual(fixedDate);
        });
    });

    describe("getHoursAgo", () => {
        it("should calculate correct date N hours ago", () => {
            expect(getHoursAgo(1, fixedDate)).toEqual(new Date("2024-01-15T11:00:00.000Z"));
            expect(getHoursAgo(6, fixedDate)).toEqual(new Date("2024-01-15T06:00:00.000Z"));
            expect(getHoursAgo(24, fixedDate)).toEqual(new Date("2024-01-14T12:00:00.000Z"));
        });
    });

    describe("getMinutesAgo", () => {
        it("should calculate correct date N minutes ago", () => {
            expect(getMinutesAgo(30, fixedDate)).toEqual(new Date("2024-01-15T11:30:00.000Z"));
            expect(getMinutesAgo(60, fixedDate)).toEqual(new Date("2024-01-15T11:00:00.000Z"));
        });
    });

    describe("AdminDatePresets", () => {
        describe("getRealTimeRanges", () => {
            it("should return correct real-time ranges", () => {
                const ranges = AdminDatePresets.getRealTimeRanges(fixedDate);

                expect(ranges.now).toEqual(fixedDate);
                expect(ranges.oneHourAgo).toEqual(new Date("2024-01-15T11:00:00.000Z"));
                expect(ranges.sixHoursAgo).toEqual(new Date("2024-01-15T06:00:00.000Z"));
                expect(ranges.oneDayAgo).toEqual(new Date("2024-01-14T12:00:00.000Z"));
            });
        });

        describe("getWeeklyRanges", () => {
            it("should return correct weekly ranges", () => {
                const ranges = AdminDatePresets.getWeeklyRanges(fixedDate);

                expect(ranges.now).toEqual(fixedDate);
                expect(ranges.oneDayAgo).toEqual(new Date("2024-01-14T12:00:00.000Z"));
                expect(ranges.sevenDaysAgo).toEqual(new Date("2024-01-08T12:00:00.000Z"));
                expect(ranges.fourteenDaysAgo).toEqual(new Date("2024-01-01T12:00:00.000Z"));
                expect(ranges.thirtyDaysAgo).toEqual(new Date("2023-12-16T12:00:00.000Z"));
            });
        });

        describe("getMonthlyRanges", () => {
            it("should return correct monthly ranges", () => {
                const ranges = AdminDatePresets.getMonthlyRanges(fixedDate);

                expect(ranges.now).toEqual(fixedDate);
                expect(ranges.thirtyDaysAgo).toEqual(new Date("2023-12-16T12:00:00.000Z"));
                expect(ranges.sixtyDaysAgo).toEqual(new Date("2023-11-16T12:00:00.000Z"));
                expect(ranges.ninetyDaysAgo).toEqual(new Date("2023-10-17T12:00:00.000Z"));
            });
        });
    });

    describe("formatDateForSQL", () => {
        it("should format date as ISO string", () => {
            const result = formatDateForSQL(fixedDate);
            expect(result).toBe("2024-01-15T12:00:00.000Z");
        });
    });

    describe("formatDateForDisplay", () => {
        it("should format date for display with default options", () => {
            const result = formatDateForDisplay(fixedDate);
            expect(result).toMatch(/Jan 15, 2024/); // Allows for different time formats
        });

        it("should format date with custom options", () => {
            const result = formatDateForDisplay(fixedDate, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            expect(result).toBe("January 15, 2024");
        });
    });
});
