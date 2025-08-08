import { describe, expect, it } from "vitest";
import { getHostname } from "../url";

describe("url utilities", () => {
    it("strips www prefix", () => {
        expect(getHostname("https://www.example.com/page")).toBe("example.com");
    });

    it("returns hostname for standard url", () => {
        expect(getHostname("https://sub.example.com")).toBe("sub.example.com");
    });

    it("returns input when url is invalid", () => {
        const invalid = "not a url";
        expect(getHostname(invalid)).toBe(invalid);
    });
});
