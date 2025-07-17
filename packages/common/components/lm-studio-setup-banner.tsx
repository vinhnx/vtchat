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
            icon: <ExternalLink className="h-4 w-4" />,
        },
        {
            title: "Start the Server",
            description: "Open terminal and start LM Studio server with CORS enabled",
            action: "lms server start --cors",
            icon: <Terminal className="h-4 w-4" />,
        },
        {
            title: "Load a Model",
            description: "In LM Studio app, download and load any compatible model",
            action: "Browse & Load Model",
            icon: <ExternalLink className="h-4 w-4" />,
        },
    ];

    return (
        <div className="relative mx-auto mb-4 max-w-3xl rounded-md border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    <div className="flex-1">
                        <h3 className="mb-2 font-medium text-neutral-900 dark:text-neutral-100">
                            Set up LM Studio for Local AI Models
                        </h3>

                        <div className="space-y-3">
                            {steps.map((step, i) => (
                                <div
                                    key={`lmstudio-step-${i}`}
                                    className={`flex items-center space-x-3 rounded-sm p-2 ${
                                        currentStep === i
                                            ? "border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50"
                                            : ""
                                    }`}
                                >
                                    <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                                            currentStep > i
                                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                                : currentStep === i
                                                  ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                                                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                                        }`}
                                    >
                                        {currentStep > i ? "✓" : i + 1}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {step.title}
                                        </p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {step.description}
                                        </p>
                                    </div>

                                    {step.link ? (
                                        <a
                                            href={step.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-400"
                                        >
                                            <span>{step.action}</span>
                                            {step.icon}
                                        </a>
                                    ) : (
                                        <code className="rounded bg-neutral-100 px-2 py-1 text-sm font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                            {step.action}
                                        </code>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex space-x-2">
                            {currentStep < steps.length - 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-300"
                                >
                                    Next Step
                                </button>
                            )}

                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-300"
                                >
                                    Previous
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsVisible(false)}
                                className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-300"
                            >
                                Got it, hide this
                            </button>
                        </div>

                        <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-medium">Privacy First:</span> All processing
                            happens locally on your machine. No data is sent to external servers.
                        </div>

                        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-medium">Need help?</span>{" "}
                            <a
                                href="https://github.com/vinhnx/vtchat/blob/main/docs/guides/lm-studio-setup.md"
                                className="font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
                            >
                                View detailed setup guide
                            </a>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
