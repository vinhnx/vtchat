import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { clearEmbeddingCache, cosine, getEmbeddingCacheStats } from "../utils/embeddings";

describe("Embeddings Utils", () => {
    beforeEach(() => {
        clearEmbeddingCache();
    });

    afterEach(() => {
        clearEmbeddingCache();
    });

    describe("cosine similarity", () => {
        test("should calculate cosine similarity correctly", () => {
            const vectorA = [1, 0, 0];
            const vectorB = [1, 0, 0];
            expect(cosine(vectorA, vectorB)).toBeCloseTo(1.0);
        });

        test("should return 0 for orthogonal vectors", () => {
            const vectorA = [1, 0, 0];
            const vectorB = [0, 1, 0];
            expect(cosine(vectorA, vectorB)).toBeCloseTo(0.0);
        });

        test("should return -1 for opposite vectors", () => {
            const vectorA = [1, 0, 0];
            const vectorB = [-1, 0, 0];
            expect(cosine(vectorA, vectorB)).toBeCloseTo(-1.0);
        });

        test("should handle normalized vectors correctly", () => {
            const vectorA = [0.6, 0.8];
            const vectorB = [0.8, 0.6];
            const similarity = cosine(vectorA, vectorB);
            expect(similarity).toBeGreaterThan(0.9); // Should be high similarity
        });

        test("should throw error for vectors of different lengths", () => {
            const vectorA = [1, 0];
            const vectorB = [1, 0, 0];
            expect(() => cosine(vectorA, vectorB)).toThrow("Vectors must have the same length");
        });

        test("should handle zero vectors", () => {
            const vectorA = [0, 0, 0];
            const vectorB = [1, 0, 0];
            expect(cosine(vectorA, vectorB)).toBe(0);
        });
    });

    describe("embedding cache", () => {
        test("should start with empty cache", () => {
            const stats = getEmbeddingCacheStats();
            expect(stats.size).toBe(0);
            expect(stats.keys).toEqual([]);
        });

        test("should clear cache properly", () => {
            // This test assumes cache functionality is working
            clearEmbeddingCache();
            const stats = getEmbeddingCacheStats();
            expect(stats.size).toBe(0);
        });
    });
});
