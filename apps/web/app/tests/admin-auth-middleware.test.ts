import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, isRequestFromAdmin } from "../../lib/middleware/admin-auth";

// Mock dependencies
vi.mock("@repo/shared/lib/logger", () => ({
    log: {
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../lib/auth-server", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

vi.mock("../../lib/database", () => ({
    db: {
        query: {
            users: {
                findFirst: vi.fn(),
            },
        },
    },
}));

const mockAuth = vi.hoisted(() => ({
    api: {
        getSession: vi.fn(),
    },
}));

const mockDb = vi.hoisted(() => ({
    query: {
        users: {
            findFirst: vi.fn(),
        },
    },
}));

describe("Admin Auth Middleware", () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = new NextRequest("http://localhost:3000/api/admin/test");
    });

    describe("requireAdminAuth", () => {
        it("should return unauthorized when no session exists", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue(null);

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.response).toBeInstanceOf(NextResponse);
                const responseData = await result.response.json();
                expect(responseData.error).toBe("Unauthorized");
            }
        });

        it("should return unauthorized when session has no user", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({ user: null });

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(false);
            if (!result.success) {
                const responseData = await result.response.json();
                expect(responseData.error).toBe("Unauthorized");
            }
        });

        it("should return forbidden when user is not found in database", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({
                user: { id: "user123", email: "test@example.com" },
            });
            (mockDb.query.users.findFirst as Mock).mockResolvedValue(null);

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(false);
            if (!result.success) {
                const responseData = await result.response.json();
                expect(responseData.error).toBe("Forbidden");
            }
        });

        it("should return forbidden when user is not admin", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({
                user: { id: "user123", email: "test@example.com" },
            });
            (mockDb.query.users.findFirst as Mock).mockResolvedValue({
                id: "user123",
                role: "user",
                banned: false,
            });

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(false);
            if (!result.success) {
                const responseData = await result.response.json();
                expect(responseData.error).toBe("Forbidden");
            }
        });

        it("should return forbidden when user is banned", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({
                user: { id: "user123", email: "test@example.com" },
            });
            (mockDb.query.users.findFirst as Mock).mockResolvedValue({
                id: "user123",
                role: "admin",
                banned: true,
            });

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(false);
            if (!result.success) {
                const responseData = await result.response.json();
                expect(responseData.error).toBe("Forbidden");
            }
        });

        it("should return success when user is valid admin", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({
                user: { id: "user123", email: "admin@example.com" },
            });
            (mockDb.query.users.findFirst as Mock).mockResolvedValue({
                id: "user123",
                role: "admin",
                banned: false,
            });

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.user).toEqual({
                    id: "user123",
                    email: "admin@example.com",
                    role: "admin",
                });
            }
        });

        it("should handle errors gracefully", async () => {
            (mockAuth.api.getSession as Mock).mockRejectedValue(new Error("Database error"));

            const result = await requireAdminAuth(mockRequest);

            expect(result.success).toBe(false);
            if (!result.success) {
                const responseData = await result.response.json();
                expect(responseData.error).toBe("Internal server error");
            }
        });
    });

    describe("isRequestFromAdmin", () => {
        it("should return true for valid admin", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({
                user: { id: "user123", email: "admin@example.com" },
            });
            (mockDb.query.users.findFirst as Mock).mockResolvedValue({
                id: "user123",
                role: "admin",
                banned: false,
            });

            const result = await isRequestFromAdmin(mockRequest);

            expect(result).toBe(true);
        });

        it("should return false for non-admin", async () => {
            (mockAuth.api.getSession as Mock).mockResolvedValue({
                user: { id: "user123", email: "user@example.com" },
            });
            (mockDb.query.users.findFirst as Mock).mockResolvedValue({
                id: "user123",
                role: "user",
                banned: false,
            });

            const result = await isRequestFromAdmin(mockRequest);

            expect(result).toBe(false);
        });

        it("should return false on error", async () => {
            (mockAuth.api.getSession as Mock).mockRejectedValue(new Error("Error"));

            const result = await isRequestFromAdmin(mockRequest);

            expect(result).toBe(false);
        });
    });
});
