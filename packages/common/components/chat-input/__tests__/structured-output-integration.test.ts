import { describe, expect, it } from "vitest";

describe("Structured Output Features", () => {
    it("should have structured output components available", () => {
        // Test that components can be imported without error
        expect(() => {
            const { StructuredOutputButton } = require("../structured-output-button");
            return StructuredOutputButton;
        }).not.toThrow();
    });

    it("should validate structured output schemas", () => {
        // Test basic zod schema validation without AI SDK
        const z = require("zod");

        const BasicSchema = z.object({
            name: z.string(),
            email: z.string().optional(),
        });

        const validData = { name: "John Doe", email: "john@example.com" };
        const result = BasicSchema.safeParse(validData);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.name).toBe("John Doe");
            expect(result.data.email).toBe("john@example.com");
        }
    });

    it("should validate invalid data", () => {
        const z = require("zod");

        const BasicSchema = z.object({
            name: z.string(),
            email: z.string().optional(),
        });

        const invalidData = { name: 123 }; // name should be string
        const result = BasicSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
    });
});
