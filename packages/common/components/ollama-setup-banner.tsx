"use client";

import { AlertCircle, ExternalLink, Terminal, X } from "lucide-react";
import { useState } from "react";

export function OllamaSetupBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    if (!isVisible) return null;

    const steps = [
        {
            title: "Install Ollama",
            description: "Download and install Ollama from the official website",
            action: "Download Ollama",
            link: "https://ollama.ai/",
            icon: <ExternalLink size={16} />,
        },
        {
            title: "Start Ollama Server",
            description: "Open terminal and start the Ollama server",
            action: "ollama serve",
            icon: <Terminal size={16} />,
        },
        {
            title: "Download a Model",
            description: "Pull and run a model (e.g., Llama 3.3, Qwen 3, or Gemma 3)",
            action: "ollama pull llama3.3",
            icon: <Terminal size={16} />,
        },
    ];

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="text-green-500 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-medium text-green-900 mb-2">
                            🦙 Set up Ollama for Local AI Models
                        </h3>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center space-x-3 p-2 rounded ${
                                        currentStep === index
                                            ? "bg-green-100 border border-green-300"
                                            : "bg-white"
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                            currentStep > index
                                                ? "bg-green-500 text-white"
                                                : currentStep === index
                                                  ? "bg-green-500 text-white"
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
                                            className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
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
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
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
                                href="/docs/guides/ollama-setup"
                                className="text-green-600 hover:text-green-800 underline"
                            >
                                View detailed setup guide
                            </a>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-green-400 hover:text-green-600"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
