import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import {
    AdminApiResponses,
    AdminApiSuccess,
    handleAdminRouteError,
    executeAdminRoute,
    formatCostFromCents,
    calculateConversionRate,
} from "@repo/shared/utils/admin-api-responses";

// Mock logger
vi.mock("@repo/shared/lib/logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

describe("Admin API Responses", () => {
    describe("AdminApiResponses", () => {
        it("should create unauthorized response", async () => {
            const response = AdminApiResponses.unauthorized();
            const data = await response.json();
            
            expect(response.status).toBe(401);
            expect(data.error).toBe("Unauthorized");
        });

        it("should create unauthorized response with custom message", async () => {
            const response = AdminApiResponses.unauthorized("Custom unauthorized message");
            const data = await response.json();
            
            expect(response.status).toBe(401);
            expect(data.error).toBe("Custom unauthorized message");
        });

        it("should create forbidden response", async () => {
            const response = AdminApiResponses.forbidden();
            const data = await response.json();
            
            expect(response.status).toBe(403);
            expect(data.error).toBe("Forbidden");
        });

        it("should create bad request response with details", async () => {
            const details = { field: "email", message: "Invalid format" };
            const response = AdminApiResponses.badRequest("Validation failed", details);
            const data = await response.json();
            
            expect(response.status).toBe(400);
            expect(data.error).toBe("Validation failed");
            expect(data.details).toEqual(details);
        });

        it("should create internal error response", async () => {
            const response = AdminApiResponses.internalError();
            const data = await response.json();
            
            expect(response.status).toBe(500);
            expect(data.error).toBe("Internal Server Error");
        });
    });

    describe("AdminApiSuccess", () => {
        it("should create ok response with data", async () => {
            const testData = { id: 1, name: "Test" };
            const response = AdminApiSuccess.ok(testData);
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.data).toEqual(testData);
        });

        it("should create ok response with data and message", async () => {
            const testData = { id: 1, name: "Test" };
            const response = AdminApiSuccess.ok(testData, "Success message");
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.data).toEqual(testData);
            expect(data.message).toBe("Success message");
        });

        it("should create created response", async () => {
            const testData = { id: 1, name: "New Item" };
            const response = AdminApiSuccess.created(testData);
            const data = await response.json();
            
            expect(response.status).toBe(201);
            expect(data.data).toEqual(testData);
            expect(data.message).toBe("Created successfully");
        });

        it("should create no content response", () => {
            const response = AdminApiSuccess.noContent();
            
            expect(response.status).toBe(204);
        });

        it("should create paginated response", async () => {
            const testData = [{ id: 1 }, { id: 2 }];
            const meta = { total: 10, page: 1, limit: 2 };
            const response = AdminApiSuccess.paginated(testData, meta);
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.data).toEqual(testData);
            expect(data.meta.total).toBe(10);
            expect(data.meta.page).toBe(1);
            expect(data.meta.limit).toBe(2);
            expect(data.meta.totalPages).toBe(5);
            expect(data.meta.hasNext).toBe(true);
            expect(data.meta.hasPrev).toBe(false);
        });
    });

    describe("handleAdminRouteError", () => {
        it("should handle ValidationError", async () => {
            const error = new Error("Invalid input");
            error.name = "ValidationError";
            
            const response = handleAdminRouteError(error, "test context");
            const data = await response.json();
            
            expect(response.status).toBe(422);
            expect(data.error).toBe("Invalid input");
        });

        it("should handle NotFoundError", async () => {
            const error = new Error("Resource not found");
            error.name = "NotFoundError";
            
            const response = handleAdminRouteError(error);
            const data = await response.json();
            
            expect(response.status).toBe(404);
            expect(data.error).toBe("Resource not found");
        });

        it("should handle ConflictError", async () => {
            const error = new Error("Resource conflict");
            error.name = "ConflictError";
            
            const response = handleAdminRouteError(error);
            const data = await response.json();
            
            expect(response.status).toBe(409);
            expect(data.error).toBe("Resource conflict");
        });

        it("should handle generic Error", async () => {
            const error = new Error("Generic error");
            
            const response = handleAdminRouteError(error);
            const data = await response.json();
            
            expect(response.status).toBe(500);
            expect(data.error).toBe("An unexpected error occurred");
        });

        it("should handle non-Error objects", async () => {
            const error = "String error";
            
            const response = handleAdminRouteError(error);
            const data = await response.json();
            
            expect(response.status).toBe(500);
            expect(data.error).toBe("An unexpected error occurred");
        });
    });

    describe("executeAdminRoute", () => {
        it("should execute successful route handler", async () => {
            const testData = { success: true };
            const handler = vi.fn().mockResolvedValue(testData);
            
            const response = await executeAdminRoute(handler, "test context");
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.data).toEqual(testData);
            expect(handler).toHaveBeenCalledOnce();
        });

        it("should handle route handler errors", async () => {
            const error = new Error("Handler error");
            const handler = vi.fn().mockRejectedValue(error);
            
            const response = await executeAdminRoute(handler, "test context");
            const data = await response.json();
            
            expect(response.status).toBe(500);
            expect(data.error).toBe("An unexpected error occurred");
            expect(handler).toHaveBeenCalledOnce();
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
