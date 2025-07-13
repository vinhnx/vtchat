import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VtPlusFeature, VT_PLUS_LIMITS } from '@repo/common/config/vtPlusLimits';
import { consumeQuota, getUsage, getAllUsage } from '@repo/common/lib/vtplusRateLimiter';

// Mock database
const mockDb = {
    transaction: vi.fn(),
    select: vi.fn(),
    execute: vi.fn(),
};

const mockSchema = {
    vtplusUsage: {
        userId: 'userId',
        feature: 'feature',
        periodStart: 'periodStart',
    },
};

// Mock imports
vi.mock('@repo/shared/lib/database', () => ({
    db: mockDb,
    schema: mockSchema,
}));

vi.mock('@repo/shared/lib/logger', () => ({
    log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock('@repo/common/utils/neon-mcp', () => ({
    queryMcp: vi.fn(),
    isNeonMcpEnabled: vi.fn().mockReturnValue(false),
}));

describe('VT+ Daily Limits', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset process.env for clean tests
        delete process.env.USE_NEON_MCP;
        delete process.env.VTPLUS_DAILY_LIMIT_DR;
        delete process.env.VTPLUS_DAILY_LIMIT_PS;
        delete process.env.VTPLUS_MONTHLY_LIMIT_RAG;
    });

    describe('Configuration', () => {
        it('should set daily limits for Deep Research and Pro Search', () => {
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH]).toEqual({
                limit: 5,
                window: 'daily',
            });

            expect(VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH]).toEqual({
                limit: 10,
                window: 'daily',
            });

            expect(VT_PLUS_LIMITS[VtPlusFeature.RAG]).toEqual({
                limit: 2000,
                window: 'monthly',
            });
        });

        it('should respect environment variables for limits', () => {
            // Set environment variables
            process.env.VTPLUS_DAILY_LIMIT_DR = '3';
            process.env.VTPLUS_DAILY_LIMIT_PS = '7';
            process.env.VTPLUS_MONTHLY_LIMIT_RAG = '1500';

            // Re-import to get updated config
            const { VT_PLUS_LIMITS: updatedLimits } = require('@repo/common/config/vtPlusLimits');

            expect(updatedLimits[VtPlusFeature.DEEP_RESEARCH].limit).toBe(3);
            expect(updatedLimits[VtPlusFeature.PRO_SEARCH].limit).toBe(7);
            expect(updatedLimits[VtPlusFeature.RAG].limit).toBe(1500);
        });
    });

    describe('Daily Period Calculation', () => {
        it('should use current day for daily window features', async () => {
            const mockRecord = {
                used: 1,
                feature: VtPlusFeature.DEEP_RESEARCH,
                userId: 'user123',
                periodStart: new Date().toISOString().split('T')[0],
            };

            mockDb.select = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([mockRecord]),
                    }),
                }),
            });

            const usage = await getUsage('user123', VtPlusFeature.DEEP_RESEARCH);

            // Verify it uses today's date for daily window
            const today = new Date();
            const expectedPeriodStart = new Date(
                Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
            );

            expect(usage.periodStart.toISOString().split('T')[0]).toBe(
                expectedPeriodStart.toISOString().split('T')[0]
            );
        });

        it('should use current month for monthly window features', async () => {
            const mockRecord = {
                used: 100,
                feature: VtPlusFeature.RAG,
                userId: 'user123',
                periodStart: new Date().toISOString().split('T')[0],
            };

            mockDb.select = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([mockRecord]),
                    }),
                }),
            });

            const usage = await getUsage('user123', VtPlusFeature.RAG);

            // Verify it uses first day of current month
            const today = new Date();
            const expectedPeriodStart = new Date(
                Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
            );

            expect(usage.periodStart.toISOString().split('T')[0]).toBe(
                expectedPeriodStart.toISOString().split('T')[0]
            );
        });
    });

    describe('Mixed Window Query Optimization', () => {
        it('should efficiently query features with different windows in getAllUsage', async () => {
            const dailyRecord = {
                used: 3,
                feature: VtPlusFeature.DEEP_RESEARCH,
                userId: 'user123',
                periodStart: new Date().toISOString().split('T')[0],
            };

            const monthlyRecord = {
                used: 500,
                feature: VtPlusFeature.RAG,
                userId: 'user123',
                periodStart: new Date().toISOString().split('T')[0],
            };

            let callCount = 0;
            mockDb.select = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue(() => {
                            callCount++;
                            // Return different records based on call order
                            if (callCount === 1) {
                                // First call should get daily features (DR, PS)
                                return [dailyRecord];
                            } else {
                                // Second call should get monthly features (RAG)
                                return [monthlyRecord];
                            }
                        }),
                    }),
                }),
            });

            const allUsage = await getAllUsage('user123');

            // Should make separate queries for different window types
            expect(mockDb.select).toHaveBeenCalledTimes(2);

            // Verify correct limits are applied
            expect(allUsage[VtPlusFeature.DEEP_RESEARCH].limit).toBe(5);
            expect(allUsage[VtPlusFeature.PRO_SEARCH].limit).toBe(10);
            expect(allUsage[VtPlusFeature.RAG].limit).toBe(2000);
        });
    });

    describe('Quota Consumption with Windows', () => {
        it('should consume daily quota correctly', async () => {
            const mockTransaction = vi.fn().mockImplementation(async (callback) => {
                const mockTx = {
                    execute: vi.fn().mockResolvedValue({
                        rows: [{ used: 1, would_exceed: false }],
                    }),
                };
                await callback(mockTx);
            });

            mockDb.transaction = mockTransaction;

            await consumeQuota({
                userId: 'user123',
                feature: VtPlusFeature.DEEP_RESEARCH,
                amount: 1,
            });

            expect(mockTransaction).toHaveBeenCalled();

            // Verify the SQL uses daily period calculation
            const executeCall = mockTransaction.mock.calls[0][0];
            const mockTx = { execute: vi.fn().mockResolvedValue({ rows: [{ used: 1 }] }) };
            await executeCall(mockTx);

            expect(mockTx.execute).toHaveBeenCalled();
        });
    });
});
