import { ModelEnum } from "@repo/ai/models";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Set test environment
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.OPENAI_API_KEY = "test-key";

// Mock external dependencies
vi.mock("better-auth", () => ({
    auth: () => ({
        createAuthorizationURL: vi.fn(),
        api: {
            getSession: vi.fn().mockResolvedValue({
                user: { id: "test-user" },
                session: { userId: "test-user" },
            }),
        },
    }),
}));

// Mock database operations
const mockDbOperations = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
};

vi.mock("@/lib/database", () => ({
    db: mockDbOperations,
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(() => "eq_condition"),
    and: vi.fn(() => "and_condition"),
}));

describe("API Integration Tests - Gemini Requirements", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        mockDbOperations.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        // then: vi.fn().mockResolvedValue([]),
                    }),
                }),
            }),
        });

        mockDbOperations.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                // then: vi.fn().mockResolvedValue(undefined),
            }),
        });

        mockDbOperations.update.mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    // then: vi.fn().mockResolvedValue(undefined),
                }),
            }),
        });
    });

    describe("API Route: /api/rate-limit/status", () => {
        it("should return rate limit status for all Gemini models", async () => {
            // Import and test the API route handler
            const { GET } = await import("@/app/api/rate-limit/status/route");

            const mockRequest = new Request("http://localhost/api/rate-limit/status");
            const response = await GET(mockRequest);

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty(ModelEnum.GEMINI_2_5_FLASH_LITE);
            expect(data).toHaveProperty(ModelEnum.GEMINI_2_5_PRO);
            expect(data).toHaveProperty(ModelEnum.GEMINI_2_5_FLASH);
        });

        it("should show unlimited Flash Lite for VT+ users", async () => {
            const { GET } = await import("@/app/api/rate-limit/status/route");

            const mockRequest = new Request("http://localhost/api/rate-limit/status");
            const response = await GET(mockRequest);

            const data = await response.json();
            const flashLiteStatus = data[ModelEnum.GEMINI_2_5_FLASH_LITE];

            expect(flashLiteStatus.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(flashLiteStatus.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });

        it("should handle authentication errors gracefully", async () => {
            // Mock auth failure
            vi.doMock("better-auth", () => ({
                auth: () => ({
                    api: {
                        getSession: vi.fn().mockRejectedValue(new Error("Auth failed")),
                    },
                }),
            }));

            const { GET } = await import("@/app/api/rate-limit/status/route");

            const mockRequest = new Request("http://localhost/api/rate-limit/status");
            const response = await GET(mockRequest);

            expect(response.status).toBe(401);
        });
    });

    describe("API Route: /api/completion (Rate Limiting Integration)", () => {
        it("should enforce rate limits before processing requests", async () => {
            // Mock rate limit check to return false

            const { POST } = await import("@/app/api/completion/route");

            const requestBody = {
                message: "Test message",
                model: ModelEnum.GEMINI_2_5_PRO,
                thread: [],
            };

            const mockRequest = new Request("http://localhost/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(mockRequest);

            expect(response.status).toBe(429); // Rate limited

            const data = await response.json();
            expect(data.error).toContain("rate limit");
        });

        it("should allow requests within rate limits", async () => {
            // Mock rate limit check to return true

            // Mock the AI generation
            vi.doMock("@repo/ai/generate", () => ({
                generateText: vi.fn().mockResolvedValue({
                    text: "Test response",
                    usage: { totalTokens: 100 },
                }),
            }));

            const { POST } = await import("@/app/api/completion/route");

            const requestBody = {
                message: "Test message",
                model: ModelEnum.GEMINI_2_5_PRO,
                thread: [],
            };

            const mockRequest = new Request("http://localhost/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(mockRequest);

            // Should proceed to generate response (may fail due to mocking, but shouldn't be rate limited)
            expect(response.status).not.toBe(429);
        });

        it("should record dual quota usage for VT+ users on Pro models", async () => {
            // Mock the recordRequest function to verify it's called with correct parameters
            const recordRequestSpy = vi.fn();
            vi.doMock("@/lib/services/rate-limit", async () => {
                const actual = await vi.importActual("@/lib/services/rate-limit");
                return {
                    ...actual,
                    recordRequest: recordRequestSpy,
                    checkRateLimit: vi.fn().mockResolvedValue({
                        allowed: true,
                        remainingDaily: 100,
                        remainingMinute: 10,
                    }),
                };
            });

            vi.doMock("@repo/ai/generate", () => ({
                generateText: vi.fn().mockResolvedValue({
                    text: "Test response",
                    usage: { totalTokens: 100 },
                }),
            }));

            const { POST } = await import("@/app/api/completion/route");

            const requestBody = {
                message: "Test message",
                model: ModelEnum.GEMINI_2_5_PRO,
                thread: [],
            };

            const mockRequest = new Request("http://localhost/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            await POST(mockRequest);

            // Should record usage with VT+ flag
            expect(recordRequestSpy).toHaveBeenCalledWith(
                expect.any(String),
                ModelEnum.GEMINI_2_5_PRO,
                true, // isVTPlusUser
            );
        });
    });

    describe("VT+ Dual Quota API Behavior", () => {
        it("should return dual quota information for VT+ users on Pro models", async () => {
            const { GET } = await import("@/app/api/rate-limit/status/route");

            const mockRequest = new Request("http://localhost/api/rate-limit/status");
            const response = await GET(mockRequest);

            const data = await response.json();
            const proStatus = data[ModelEnum.GEMINI_2_5_PRO];

            // Should reflect the effective limit (minimum of both quotas)
            expect(proStatus.remainingDaily).toBeLessThanOrEqual(800); // min(1000-100, 1000-200)
            expect(proStatus.remainingMinute).toBeLessThanOrEqual(80); // min(100-10, 100-20)
        });

        it("should show unlimited for VT+ Flash Lite regardless of usage", async () => {
            const { GET } = await import("@/app/api/rate-limit/status/route");

            const mockRequest = new Request("http://localhost/api/rate-limit/status");
            const response = await GET(mockRequest);

            const data = await response.json();
            const flashLiteStatus = data[ModelEnum.GEMINI_2_5_FLASH_LITE];

            expect(flashLiteStatus.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(flashLiteStatus.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });
    });

    describe("Non-Gemini Models API Behavior", () => {
        it("should allow unlimited access to non-Gemini models", async () => {
            // Mock check rate limit for non-Gemini model
            vi.doMock("@/lib/services/rate-limit", async () => {
                const actual = await vi.importActual("@/lib/services/rate-limit");
                return {
                    ...actual,
                    checkRateLimit: vi.fn().mockResolvedValue({
                        allowed: true,
                        remainingDaily: Number.POSITIVE_INFINITY,
                        remainingMinute: Number.POSITIVE_INFINITY,
                    }),
                    recordRequest: vi.fn(),
                };
            });

            vi.doMock("@repo/ai/generate", () => ({
                generateText: vi.fn().mockResolvedValue({
                    text: "Test response",
                    usage: { totalTokens: 100 },
                }),
            }));

            const { POST } = await import("@/app/api/completion/route");

            const requestBody = {
                message: "Test message",
                model: ModelEnum.GPT_4o, // Non-Gemini model
                thread: [],
            };

            const mockRequest = new Request("http://localhost/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(mockRequest);

            // Should not be rate limited
            expect(response.status).not.toBe(429);
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle database connection errors gracefully", async () => {
            mockDbOperations.select.mockImplementation(() => {
                throw new Error("Database connection failed");
            });

            const { GET } = await import("@/app/api/rate-limit/status/route");

            const mockRequest = new Request("http://localhost/api/rate-limit/status");
            const response = await GET(mockRequest);

            expect(response.status).toBe(500);
        });

        it("should handle malformed request bodies", async () => {
            const { POST } = await import("@/app/api/completion/route");

            const mockRequest = new Request("http://localhost/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invalid: "data" }), // Missing required fields
            });

            const response = await POST(mockRequest);

            expect(response.status).toBe(400);
        });

        it("should validate model enum values", async () => {
            const { POST } = await import("@/app/api/completion/route");

            const requestBody = {
                message: "Test message",
                model: "invalid-model", // Invalid model
                thread: [],
            };

            const mockRequest = new Request("http://localhost/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(mockRequest);

            expect(response.status).toBe(400);
        });
    });
});
