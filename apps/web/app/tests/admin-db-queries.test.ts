import { describe, expect, it } from "vitest";
import {
    createCountQuery,
    UserQueries,
    SessionQueries,
    ProviderUsageQueries,
    VtPlusUsageQueries,
    FeedbackQueries,
    ResourceQueries,
    formatCostFromCents,
    calculateConversionRate,
} from "@repo/shared/utils/admin-db-queries";

describe("Admin DB Queries", () => {
    // Mock table objects
    const mockUsersTable = {
        id: "users.id",
        createdAt: "users.createdAt",
        planSlug: "users.planSlug",
        banned: "users.banned",
    };

    const mockSessionsTable = {
        id: "sessions.id",
        createdAt: "sessions.createdAt",
        userId: "sessions.userId",
    };

    const mockProviderUsageTable = {
        provider: "providerUsage.provider",
        requestTimestamp: "providerUsage.requestTimestamp",
        estimatedCostCents: "providerUsage.estimatedCostCents",
    };

    const mockVtPlusUsageTable = {
        feature: "vtplusUsage.feature",
        periodStart: "vtplusUsage.periodStart",
        used: "vtplusUsage.used",
        userId: "vtplusUsage.userId",
    };

    const mockFeedbackTable = {
        id: "feedback.id",
        createdAt: "feedback.createdAt",
    };

    const mockResourcesTable = {
        id: "resources.id",
        createdAt: "resources.createdAt",
    };

    const testDate = new Date("2024-01-15T12:00:00.000Z");

    describe("createCountQuery", () => {
        it("should create basic count query without date filter", () => {
            const query = createCountQuery(mockUsersTable);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockUsersTable);
            expect(query.where).toBeUndefined();
        });

        it("should create count query with date filter", () => {
            const query = createCountQuery(mockUsersTable, "createdAt", testDate);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockUsersTable);
            expect(query.where).toBeDefined();
        });
    });

    describe("UserQueries", () => {
        it("should create getTotalUsers query", () => {
            const query = UserQueries.getTotalUsers(mockUsersTable);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockUsersTable);
        });

        it("should create getNewUsers query", () => {
            const query = UserQueries.getNewUsers(mockUsersTable, testDate);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockUsersTable);
            expect(query.where).toBeDefined();
        });

        it("should create getVtPlusUsers query", () => {
            const query = UserQueries.getVtPlusUsers(mockUsersTable);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockUsersTable);
            expect(query.where).toBeDefined();
        });

        it("should create getBannedUsers query", () => {
            const query = UserQueries.getBannedUsers(mockUsersTable);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockUsersTable);
            expect(query.where).toBeDefined();
        });

        it("should create getDailyRegistrations query", () => {
            const query = UserQueries.getDailyRegistrations(mockUsersTable, testDate);
            
            expect(query.select.date).toBeDefined();
            expect(query.select.registrations).toEqual(expect.any(Function));
            expect(query.from).toBe(mockUsersTable);
            expect(query.where).toBeDefined();
            expect(query.groupBy).toBeDefined();
            expect(query.orderBy).toBeDefined();
        });
    });

    describe("SessionQueries", () => {
        it("should create getActiveSessions query", () => {
            const query = SessionQueries.getActiveSessions(mockSessionsTable, testDate);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockSessionsTable);
            expect(query.where).toBeDefined();
        });

        it("should create getDailyActiveUsers query", () => {
            const query = SessionQueries.getDailyActiveUsers(mockSessionsTable, testDate);
            
            expect(query.select.date).toBeDefined();
            expect(query.select.activeUsers).toBeDefined();
            expect(query.from).toBe(mockSessionsTable);
            expect(query.where).toBeDefined();
            expect(query.groupBy).toBeDefined();
            expect(query.orderBy).toBeDefined();
        });
    });

    describe("ProviderUsageQueries", () => {
        it("should create getProviderStats query", () => {
            const query = ProviderUsageQueries.getProviderStats(mockProviderUsageTable, testDate);
            
            expect(query.select.provider).toBe(mockProviderUsageTable.provider);
            expect(query.select.totalRequests).toEqual(expect.any(Function));
            expect(query.select.totalCostCents).toEqual(expect.any(Function));
            expect(query.from).toBe(mockProviderUsageTable);
            expect(query.where).toBeDefined();
            expect(query.groupBy).toBe(mockProviderUsageTable.provider);
        });

        it("should create getTotalProviderCost query", () => {
            const query = ProviderUsageQueries.getTotalProviderCost(mockProviderUsageTable, testDate);
            
            expect(query.select.totalCostCents).toEqual(expect.any(Function));
            expect(query.from).toBe(mockProviderUsageTable);
            expect(query.where).toBeDefined();
        });
    });

    describe("VtPlusUsageQueries", () => {
        it("should create getFeatureUsage query", () => {
            const query = VtPlusUsageQueries.getFeatureUsage(mockVtPlusUsageTable, testDate);
            
            expect(query.select.feature).toBe(mockVtPlusUsageTable.feature);
            expect(query.select.totalUsage).toEqual(expect.any(Function));
            expect(query.select.uniqueUsers).toBeDefined();
            expect(query.from).toBe(mockVtPlusUsageTable);
            expect(query.where).toBeDefined();
            expect(query.groupBy).toBe(mockVtPlusUsageTable.feature);
        });
    });

    describe("FeedbackQueries", () => {
        it("should create getTotalFeedback query", () => {
            const query = FeedbackQueries.getTotalFeedback(mockFeedbackTable);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockFeedbackTable);
        });

        it("should create getRecentFeedback query", () => {
            const query = FeedbackQueries.getRecentFeedback(mockFeedbackTable, testDate);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockFeedbackTable);
            expect(query.where).toBeDefined();
        });
    });

    describe("ResourceQueries", () => {
        it("should create getTotalResources query", () => {
            const query = ResourceQueries.getTotalResources(mockResourcesTable);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockResourcesTable);
        });

        it("should create getRecentResources query", () => {
            const query = ResourceQueries.getRecentResources(mockResourcesTable, testDate);
            
            expect(query.select).toEqual({ count: expect.any(Function) });
            expect(query.from).toBe(mockResourcesTable);
            expect(query.where).toBeDefined();
        });
    });

    describe("Helper functions", () => {
        describe("formatCostFromCents", () => {
            it("should format cents to USD string", () => {
                expect(formatCostFromCents(1000)).toBe("10.00");
                expect(formatCostFromCents(150)).toBe("1.50");
                expect(formatCostFromCents(5)).toBe("0.05");
            });

            it("should handle null and undefined", () => {
                expect(formatCostFromCents(null)).toBe("0.00");
                expect(formatCostFromCents(undefined)).toBe("0.00");
                expect(formatCostFromCents(0)).toBe("0.00");
            });
        });

        describe("calculateConversionRate", () => {
            it("should calculate conversion rate", () => {
                expect(calculateConversionRate(25, 100)).toBe("25.00");
                expect(calculateConversionRate(1, 3)).toBe("33.33");
                expect(calculateConversionRate(0, 100)).toBe("0.00");
            });

            it("should handle zero total users", () => {
                expect(calculateConversionRate(5, 0)).toBe("0.00");
            });
        });
    });
});
