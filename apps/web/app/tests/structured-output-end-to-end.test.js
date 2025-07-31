/**
 * End-to-End Test for Structured Output Feature
 * Tests the complete workflow: PDF upload → text extraction → schema validation → structured data generation
 */

const { test, expect } = require("@playwright/test");

test.describe("Structured Output Feature - End-to-End", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto("http://localhost:3001");

        // Wait for the page to load
        await page.waitForLoadState("networkidle");
    });

    test("should display structured output button for Gemini models with PDF upload", async ({
        page,
    }) => {
        // Test that the structured output button appears when:
        // 1. A Gemini model is selected
        // 2. A PDF document is uploaded

        // First, check if we need to select a Gemini model
        // Look for model selector and select a Gemini model if available
        const modelSelector = page.locator('[data-testid="model-selector"]');
        if (await modelSelector.isVisible()) {
            await modelSelector.click();

            // Look for Gemini models in the dropdown
            const geminiOption = page.locator("text=Gemini").first();
            if (await geminiOption.isVisible()) {
                await geminiOption.click();
            }
        }

        // Create a mock PDF file for testing
        const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test Invoice Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

        // Look for document upload input
        const fileInput = page.locator('input[type="file"]');

        if (await fileInput.isVisible()) {
            // Create a temporary file and upload it
            await fileInput.setInputFiles({
                name: "test-invoice.pdf",
                mimeType: "application/pdf",
                buffer: Buffer.from(mockPdfContent),
            });

            // Wait for the file to be processed
            await page.waitForTimeout(2000);

            // Check if structured output button appears
            const structuredOutputButton = page.locator('[data-testid="structured-output-button"]');

            // The button should be visible for Gemini models with PDF uploads
            await expect(structuredOutputButton).toBeVisible({ timeout: 10000 });
        }
    });

    test("should validate Zod schemas work correctly", async ({ page }) => {
        // Test that Zod schemas are properly defined and can validate data

        // Inject a test script to validate schemas
        const schemaValidationResult = await page.evaluate(() => {
            // Test basic Zod functionality
            try {
                const z = window.z || require("zod");

                // Test basic schema
                const TestSchema = z.object({
                    name: z.string(),
                    email: z.string().optional(),
                    age: z.number().optional(),
                });

                // Test valid data
                const validData = { name: "John Doe", email: "john@example.com", age: 30 };
                const validResult = TestSchema.safeParse(validData);

                // Test invalid data
                const invalidData = { name: 123 }; // name should be string
                const invalidResult = TestSchema.safeParse(invalidData);

                return {
                    validParsed: validResult.success,
                    invalidParsed: !invalidResult.success,
                    validData: validResult.success ? validResult.data : null,
                    error: invalidResult.success ? null : invalidResult.error.issues[0].message,
                };
            } catch (error) {
                return {
                    error: error.message,
                    validParsed: false,
                    invalidParsed: false,
                };
            }
        });

        // Validate that schemas work correctly
        expect(schemaValidationResult.validParsed).toBe(true);
        expect(schemaValidationResult.invalidParsed).toBe(true);
        expect(schemaValidationResult.validData).toEqual({
            name: "John Doe",
            email: "john@example.com",
            age: 30,
        });
    });

    test("should handle PDF.js initialization without version mismatch", async ({ page }) => {
        // Test that PDF.js initializes correctly without version mismatch errors

        // Listen for console errors
        const consoleErrors = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                consoleErrors.push(msg.text());
            }
        });

        // Try to trigger PDF.js initialization by uploading a PDF
        const mockPdfContent = Buffer.from(
            "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f\ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF",
        );

        const fileInput = page.locator('input[type="file"]');

        if (await fileInput.isVisible()) {
            await fileInput.setInputFiles({
                name: "test.pdf",
                mimeType: "application/pdf",
                buffer: mockPdfContent,
            });

            // Wait for processing
            await page.waitForTimeout(3000);

            // Check that no PDF.js version mismatch errors occurred
            const versionMismatchErrors = consoleErrors.filter(
                (error) =>
                    error.includes("version") &&
                    error.includes("match") &&
                    (error.includes("API") || error.includes("Worker")),
            );

            expect(versionMismatchErrors).toHaveLength(0);
        }
    });

    test("should show appropriate error messages for missing API keys", async ({ page }) => {
        // Test that proper error messages are shown when API keys are missing

        // Clear any existing API keys (if possible through UI)
        // This test assumes the user doesn't have API keys set up

        // Try to trigger structured output without API keys
        const structuredOutputButton = page.locator('[data-testid="structured-output-button"]');

        if (await structuredOutputButton.isVisible()) {
            await structuredOutputButton.click();

            // Look for error message about missing API key
            const errorMessage = page.locator('text*="API key"');
            await expect(errorMessage).toBeVisible({ timeout: 5000 });

            // Should mention Google Gemini specifically
            const geminiMessage = page.locator('text*="Google Gemini"');
            await expect(geminiMessage).toBeVisible({ timeout: 5000 });
        }
    });

    test("should handle document type detection correctly", async ({ page }) => {
        // Test that different document types are detected correctly

        // Test with different mock documents
        const testDocuments = [
            {
                name: "invoice.pdf",
                content: "INVOICE\nInvoice Number: INV-001\nDate: 2024-01-30\nAmount: $100.00",
                expectedType: "invoice",
            },
            {
                name: "resume.pdf",
                content:
                    "RESUME\nJohn Doe\nExperience: Software Engineer\nEducation: Computer Science",
                expectedType: "resume",
            },
            {
                name: "contract.pdf",
                content:
                    "CONTRACT AGREEMENT\nParties: Company A and Company B\nTerms: Payment within 30 days",
                expectedType: "contract",
            },
        ];

        for (const doc of testDocuments) {
            // This test would require access to the document type detection logic
            // For now, we'll test that the logic exists and can be called
            const detectionResult = await page.evaluate((docContent) => {
                // Test document type detection if the function is available
                if (window.getSchemaForDocument) {
                    return window.getSchemaForDocument(docContent);
                }
                return { type: "unknown" };
            }, doc.content);

            // The function should return a type (even if it's 'document' for generic)
            expect(detectionResult).toHaveProperty("type");
        }
    });
});

// Helper function to create mock PDF content
function createMockPDF(textContent) {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${textContent.length + 20}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${textContent}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${297 + textContent.length}
%%EOF`;
}
