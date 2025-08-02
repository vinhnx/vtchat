import { ModelEnum } from "@repo/ai/models";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database and budget tracking
const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
};

const mockRecordProviderUsage = vi.fn();

vi.mock("@repo/shared/lib/database", () => ({
    db: mockDb,
}));

vi.mock("../../lib/services/budget-tracking", () => ({
    recordProviderUsage: mockRecordProviderUsage,
}));

vi.mock("../../lib/database/schema", () => ({
    userRateLimits: {
        userId: "userId",
        modelId: "modelId",
        id: "id",
    },
}));

// Import the rate limit functions after mocking
import { recordRequest } from "../../lib/services/rate-limit";

describe("Deep Research Model ID Fix", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock database operations to simulate successful operations
        const mockQuery = vi.fn().mockResolvedValue([]);
        mockDb.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue(mockQuery),
                }),
            }),
        });

        mockDb.insert.mockReturnValue({
            values: vi.fn().mockResolvedValue(undefined),
        });

        mockRecordProviderUsage.mockResolvedValue(undefined);
    });

    it("should record Deep Research requests with DEEP_RESEARCH model ID for VT+ users", async () => {
        const userId = "vt-plus-user-123";
        const modelId = ModelEnum.GEMINI_2_5_PRO; // Used by Deep Research
        const isVTPlusUser = true;

        await recordRequest(userId, modelId, isVTPlusUser);

        // Verify recordProviderUsage was called with DEEP_RESEARCH instead of GEMINI_2_5_PRO
        expect(mockRecordProviderUsage).toHaveBeenCalledWith(
            userId,
            "DEEP_RESEARCH", // This should be the feature ID, not the model ID
            "gemini",
        );
    });

    it("should record Pro Search requests with PRO_SEARCH model ID for VT+ users", async () => {
        const userId = "vt-plus-user-123";
        const modelId = ModelEnum.GEMINI_2_5_FLASH; // Used by Pro Search
        const isVTPlusUser = true;

        await recordRequest(userId, modelId, isVTPlusUser);

        // Verify recordProviderUsage was called with PRO_SEARCH instead of GEMINI_2_5_FLASH
        expect(mockRecordProviderUsage).toHaveBeenCalledWith(
            userId,
            "PRO_SEARCH", // This should be the feature ID, not the model ID
            "gemini",
        );
    });

    it("should record regular Gemini requests with original model ID for VT+ users", async () => {
        const userId = "vt-plus-user-123";
        const modelId = ModelEnum.GEMINI_2_5_FLASH_LITE; // Regular model
        const isVTPlusUser = true;

        await recordRequest(userId, modelId, isVTPlusUser);

        // Verify recordProviderUsage was called with the original model ID
        expect(mockRecordProviderUsage).toHaveBeenCalledWith(
            userId,
            ModelEnum.GEMINI_2_5_FLASH_LITE, // Should remain as the original model ID
            "gemini",
        );
    });

    it("should record requests with original model ID for free users", async () => {
        const userId = "free-user-123";
        const modelId = ModelEnum.GEMINI_2_5_PRO; // Used by Deep Research
        const isVTPlusUser = false; // Free user

        await recordRequest(userId, modelId, isVTPlusUser);

        // Verify recordProviderUsage was called with the original model ID for free users
        expect(mockRecordProviderUsage).toHaveBeenCalledWith(
            userId,
            ModelEnum.GEMINI_2_5_PRO, // Should remain as the original model ID for free users
            "gemini",
        );
    });

    it("should not record usage for non-Gemini models", async () => {
        const userId = "user-123";
        const modelId = "gpt-4o" as ModelEnum; // Non-Gemini model
        const isVTPlusUser = true;

        await recordRequest(userId, modelId, isVTPlusUser);

        // Verify recordProviderUsage was not called for non-Gemini models
        expect(mockRecordProviderUsage).not.toHaveBeenCalled();
    });
});
