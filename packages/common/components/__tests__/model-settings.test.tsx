import { useVtPlusAccess } from "@repo/common/hooks/use-subscription-access";
import { useSession } from "@repo/shared/lib/auth-client";
import { render, screen } from "@testing-library/react";
import { useApiKeysStore } from "../../store/api-keys.store";
import { ModelSettings } from "../model-settings";

// Mock the hooks
jest.mock("@repo/shared/lib/auth-client", () => ({
    useSession: jest.fn(),
}));

jest.mock("@repo/common/hooks/use-subscription-access", () => ({
    useVtPlusAccess: jest.fn(),
}));

jest.mock("../../store/api-keys.store", () => ({
    useApiKeysStore: jest.fn(),
}));

describe("ModelSettings", () => {
    beforeEach(() => {
        // Default mock implementations
        (useSession as jest.Mock).mockReturnValue({
            data: { user: { id: "test-user-id" } },
        });
        (useVtPlusAccess as jest.Mock).mockReturnValue(false);
        (useApiKeysStore as jest.Mock).mockReturnValue({
            getAllKeys: () => ({
                OPENAI_API_KEY: "",
                ANTHROPIC_API_KEY: "",
                GEMINI_API_KEY: "",
                OPENROUTER_API_KEY: "",
                FIREWORKS_API_KEY: "",
                XAI_API_KEY: "",
            }),
        });
    });

    it("renders the component correctly", () => {
        render(<ModelSettings />);

        // Check for main headings
        expect(screen.getByText("AI Models")).toBeInTheDocument();
        expect(screen.getByText("Models Overview")).toBeInTheDocument();
        expect(screen.getByText("Access Instructions")).toBeInTheDocument();

        // Check for provider sections
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
        expect(screen.getByText("Google")).toBeInTheDocument();

        // Check for free models section
        expect(screen.getByText("Free Models")).toBeInTheDocument();
        expect(screen.getByText("VT+ Benefits")).toBeInTheDocument();
    });

    it("shows different UI for VT+ users", () => {
        (useVtPlusAccess as jest.Mock).mockReturnValue(true);

        render(<ModelSettings />);

        // Check for VT+ specific content
        expect(screen.getByText("VT+ Subscription")).toBeInTheDocument();
        expect(screen.getByText(/VT\+ subscribers get enhanced access/)).toBeInTheDocument();
    });

    it("shows API key requirements for locked models", () => {
        render(<ModelSettings />);

        // Check for API key requirements
        expect(screen.getByText("API Key Required")).toBeInTheDocument();
        expect(screen.getByText("Add Google API key or upgrade to VT+")).toBeInTheDocument();
    });
});
