import { render, screen, fireEvent } from "@testing-library/react";
import { SendStopButton } from "../SendStopButton";
import { useChatStore } from "@repo/common/store";
import { vi } from "vitest";

// Mock the store
vi.mock("@repo/common/store", () => ({
    useChatStore: vi.fn(),
}));

// Mock the useIsChatPage hook
vi.mock("../../hooks/useIsChatPage", () => ({
    useIsChatPage: () => false,
}));

describe("SendStopButton", () => {
    const mockStopGeneration = vi.fn();
    const mockSendMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useChatStore as any).mockImplementation((selector) => {
            const state = {
                showTimeoutIndicator: false,
                generationStartTime: Date.now() - 5000, // 5 seconds ago
            };
            return selector(state);
        });
    });

    it("renders send button when not generating", () => {
        render(
            <SendStopButton
                isGenerating={false}
                stopGeneration={mockStopGeneration}
                hasTextInput={true}
                sendMessage={mockSendMessage}
            />,
        );

        const sendButton = screen.getByLabelText("Send Message");
        expect(sendButton).toBeInTheDocument();

        // Click the send button
        fireEvent.click(sendButton);
        expect(mockSendMessage).toHaveBeenCalledTimes(1);
    });

    it("renders stop button when generating", () => {
        render(
            <SendStopButton
                isGenerating={true}
                stopGeneration={mockStopGeneration}
                hasTextInput={true}
                sendMessage={mockSendMessage}
            />,
        );

        const stopButton = screen.getByLabelText("Stop Generation");
        expect(stopButton).toBeInTheDocument();

        // Click the stop button
        fireEvent.click(stopButton);
        expect(mockStopGeneration).toHaveBeenCalledTimes(1);
    });

    it("disables send button when no text input", () => {
        render(
            <SendStopButton
                isGenerating={false}
                stopGeneration={mockStopGeneration}
                hasTextInput={false}
                sendMessage={mockSendMessage}
            />,
        );

        const sendButton = screen.getByLabelText("Send Message");
        expect(sendButton).toBeDisabled();
    });

    it("shows loading spinner when timeout indicator is active", () => {
        // Mock the timeout indicator
        (useChatStore as any).mockImplementation((selector) => {
            const state = {
                showTimeoutIndicator: true,
                generationStartTime: Date.now() - 10000, // 10 seconds ago
            };
            return selector(state);
        });

        render(
            <SendStopButton
                isGenerating={true}
                stopGeneration={mockStopGeneration}
                hasTextInput={true}
                sendMessage={mockSendMessage}
            />,
        );

        const stopButton = screen.getByLabelText("Stop Generation");
        expect(stopButton).toBeInTheDocument();

        // Check for the spinner element
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });
});
