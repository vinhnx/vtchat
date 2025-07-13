"use client";

import { AlertCircle, ExternalLink, Terminal, X } from "lucide-react";
import { useState } from "react";

export function LMStudioSetupBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    if (!isVisible) return null;

    const steps = [
        {
            title: "Install LM Studio",
            description: "Download and install LM Studio from the official website",
            action: "Download LM Studio",
            link: "https://lmstudio.ai/",
            icon: <ExternalLink size={16} />,
        },
        {
            title: "Start the Server",
            description: "Open terminal and start LM Studio server with CORS enabled",
            action: "lms server start --cors",
            icon: <Terminal size={16} />,
        },
        {
            title: "Load a Model",
            description: "In LM Studio app, download and load any compatible model",
            action: "Browse & Load Model",
            icon: <ExternalLink size={16} />,
        },
    ];

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="text-blue-500 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-medium text-blue-900 mb-2">
                            🔧 Set up LM Studio for Local AI Models
                        </h3>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center space-x-3 p-2 rounded ${
                                        currentStep === index
                                            ? "bg-blue-100 border border-blue-300"
                                            : "bg-white"
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                            currentStep > index
                                                ? "bg-green-500 text-white"
                                                : currentStep === index
                                                  ? "bg-blue-500 text-white"
                                                  : "bg-gray-300 text-gray-600"
                                        }`}
                                    >
                                        {currentStep > index ? "✓" : index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{step.title}</p>
                                        <p className="text-sm text-gray-600">{step.description}</p>
                                    </div>

                                    {step.link ? (
                                        <a
                                            href={step.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            <span>{step.action}</span>
                                            {step.icon}
                                        </a>
                                    ) : (
                                        <code className="bg-gray-700 px-2 py-1 rounded text-gray-100 text-sm font-sans">
                                            {step.action}
                                        </code>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex space-x-2">
                            {currentStep < steps.length - 1 && (
                                <button
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Next Step
                                </button>
                            )}

                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                >
                                    Previous
                                </button>
                            )}

                            <button
                                onClick={() => setIsVisible(false)}
                                className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200"
                            >
                                Got it, hide this
                            </button>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                            💡 <strong>Privacy First:</strong> All processing happens locally on
                            your machine. No data is sent to external servers.
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                            📖 <strong>Need help?</strong>{" "}
                            <a
                                href="https://github.com/vinhnx/vtchat/blob/main/docs/guides/lm-studio-setup.md"
                                className="text-green-600 hover:text-green-800 underline"
                            >
                                View detailed setup guide
                            </a>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-blue-400 hover:text-blue-600"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
