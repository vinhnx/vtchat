import { describe, expect, it } from "vitest";
import {
    containsPII,
    createContentHash,
    maskPII,
    secureContentForEmbedding,
} from "@/lib/utils/content-security";

describe("Content Security", () => {
    describe("maskPII", () => {
        it("should mask email addresses", () => {
            const content = "Contact me at john.doe@example.com for more info";
            const result = maskPII(content);
            expect(result).toBe("Contact me at [EMAIL_REDACTED] for more info");
        });

        it("should mask phone numbers", () => {
            const content = "Call me at (555) 123-4567 or 555-123-4567";
            const result = maskPII(content);
            expect(result).toBe("Call me at [PHONE_REDACTED] or [PHONE_REDACTED]");
        });

        it("should mask credit card numbers", () => {
            const content = "My card is 1234 5678 9012 3456";
            const result = maskPII(content);
            expect(result).toBe("My card is [CARD_REDACTED]");
        });

        it("should mask SSN", () => {
            const content = "SSN: 123-45-6789";
            const result = maskPII(content);
            expect(result).toBe("SSN: [SSN_REDACTED]");
        });

        it("should mask URLs", () => {
            const content = "Check out https://example.com/sensitive-info";
            const result = maskPII(content);
            expect(result).toBe("Check out [URL_REDACTED]");
        });

        it("should mask IP addresses", () => {
            const content = "Server IP: 192.168.1.100";
            const result = maskPII(content);
            expect(result).toBe("Server IP: [IP_REDACTED]");
        });

        it("should mask home addresses", () => {
            const content = "I live at 123 Main Street, Apt 4B";
            const result = maskPII(content);
            expect(result).toBe("I live at [ADDRESS_REDACTED], [UNIT_REDACTED]");
        });

        it("should mask ZIP codes", () => {
            const content = "My ZIP is 12345 and extended ZIP is 98765-4321";
            const result = maskPII(content);
            expect(result).toBe("My ZIP is [ZIP_REDACTED] and extended ZIP is [ZIP_REDACTED]");
        });
    });

    describe("containsPII", () => {
        it("should detect email addresses", () => {
            expect(containsPII("Contact john@example.com")).toBe(true);
        });

        it("should detect phone numbers", () => {
            expect(containsPII("Call 555-123-4567")).toBe(true);
        });

        it("should detect addresses", () => {
            expect(containsPII("I live at 123 Oak Street")).toBe(true);
        });

        it("should return false for clean content", () => {
            expect(containsPII("This is a clean document about cats")).toBe(false);
        });
    });

    describe("createContentHash", () => {
        it("should create hash with preview for long content", () => {
            const longContent = "A".repeat(500);
            const result = createContentHash(longContent);
            expect(result).toMatch(/^A{100}\.\.\. \[HASH:[a-f0-9]{16}\]$/);
        });

        it("should mask PII in preview", () => {
            const content = `Contact john@example.com for more information. ${"A".repeat(100)}`;
            const result = createContentHash(content);
            expect(result).toContain("[EMAIL_REDACTED]");
            expect(result).toMatch(/\[HASH:[a-f0-9]{16}\]$/);
        });
    });

    describe("secureContentForEmbedding", () => {
        it("should mask PII content", () => {
            const content = "My email is john@example.com";
            const result = secureContentForEmbedding(content);
            expect(result).toBe("My email is [EMAIL_REDACTED]");
        });

        it("should truncate long non-PII content", () => {
            const longContent = `Clean content about cats. ${"A".repeat(500)}`;
            const result = secureContentForEmbedding(longContent);
            expect(result).toMatch(/\[HASH:[a-f0-9]{16}\]$/);
        });

        it("should preserve short non-PII content", () => {
            const content = "This is a short clean document";
            const result = secureContentForEmbedding(content);
            expect(result).toBe(content);
        });

        it("should handle multiple PII types", () => {
            const content =
                "Email: john@example.com, Phone: 555-123-4567, Card: 1234 5678 9012 3456";
            const result = secureContentForEmbedding(content);
            expect(result).toBe(
                "Email: [EMAIL_REDACTED], Phone: [PHONE_REDACTED], Card: [CARD_REDACTED]",
            );
        });

        it("should handle address with multiple PII elements", () => {
            const content =
                "Contact: john@test.com, Address: 456 Oak Drive, Unit 2A, ZIP: 90210, Phone: 555-999-8888";
            const result = secureContentForEmbedding(content);
            expect(result).toBe(
                "Contact: [EMAIL_REDACTED], Address: [ADDRESS_REDACTED], [UNIT_REDACTED], ZIP: [ZIP_REDACTED], Phone: [PHONE_REDACTED]",
            );
        });
    });
});
