'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { ChatMode } from '@repo/shared/config';

/**
 * Gemini 2.5 AI SDK Demo Component
 * 
 * This component demonstrates the integration described in "Get Started with Gemini 2.5: Building AI Applications with AI SDK"
 * 
 * Features showcased:
 * 1. Basic chat with Gemini 2.5 Flash
 * 2. Thinking mode with reasoning summaries
 * 3. Tool calling capabilities
 * 4. Google Search grounding
 * 5. Streaming responses
 * 6. Model switching between Pro/Flash/Flash Lite
 */

interface ThinkingConfig {
    enabled: boolean;
    budget: number;
    includeThoughts: boolean;
}

interface DemoSettings {
    model: ChatMode;
    thinkingConfig: ThinkingConfig;
    enableTools: boolean;
    enableSearch: boolean;
}

export default function Gemini25ChatDemo() {
    const [settings, setSettings] = useState<DemoSettings>({
        model: ChatMode.GEMINI_2_5_FLASH,
        thinkingConfig: {
            enabled: false,
            budget: 8192,
            includeThoughts: true,
        },
        enableTools: false,
        enableSearch: false,
    });

    const [reasoning, setReasoning] = useState<string>('');

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/completion',
        body: {
            mode: settings.model,
            thinkingMode: settings.thinkingConfig.enabled ? settings.thinkingConfig : undefined,
            webSearch: settings.enableSearch,
            tools: settings.enableTools,
        },
        onError: (error) => {
            console.error('Chat error:', error);
        },
        onFinish: (message) => {
            console.log('Chat finished:', message);
            // Extract reasoning if available
            if (message.annotations?.reasoning) {
                setReasoning(message.annotations.reasoning as string);
            }
        },
    });

    const handleModelChange = (model: ChatMode) => {
        setSettings(prev => ({ ...prev, model }));
    };

    const handleThinkingToggle = () => {
        setSettings(prev => ({
            ...prev,
            thinkingConfig: {
                ...prev.thinkingConfig,
                enabled: !prev.thinkingConfig.enabled,
            },
        }));
    };

    const handleToolsToggle = () => {
        setSettings(prev => ({ ...prev, enableTools: !prev.enableTools }));
    };

    const handleSearchToggle = () => {
        setSettings(prev => ({ ...prev, enableSearch: !prev.enableSearch }));
    };

    const getModelDisplayName = (model: ChatMode) => {
        switch (model) {
            case ChatMode.GEMINI_2_5_PRO:
                return 'Gemini 2.5 Pro (Complex Tasks)';
            case ChatMode.GEMINI_2_5_FLASH:
                return 'Gemini 2.5 Flash (Everyday Tasks)';
            case ChatMode.GEMINI_2_5_FLASH_LITE:
                return 'Gemini 2.5 Flash Lite (Cost-Efficient)';
            default:
                return 'Unknown Model';
        }
    };

    const examplePrompts = [
        {
            title: 'Basic Generation',
            prompt: 'Explain the concept of quantum computing in simple terms.',
            description: 'Test basic text generation capabilities',
        },
        {
            title: 'Thinking Mode',
            prompt: 'What is the sum of the first 15 prime numbers? Show your reasoning step by step.',
            description: 'Demonstrates thinking capabilities with reasoning',
            requiresThinking: true,
        },
        {
            title: 'Tool Calling',
            prompt: 'What\'s the current weather in Tokyo and New York?',
            description: 'Tests tool calling with weather functions',
            requiresTools: true,
        },
        {
            title: 'Search Grounding',
            prompt: 'What are the latest AI research breakthroughs this month? Include specific dates and sources.',
            description: 'Uses Google Search for up-to-date information',
            requiresSearch: true,
        },
        {
            title: 'Complex Reasoning',
            prompt: 'Design a sustainable city transportation system. Consider environmental, economic, and social factors.',
            description: 'Complex multi-step reasoning task',
            requiresThinking: true,
        },
    ];

    const handleExamplePrompt = (example: typeof examplePrompts[0]) => {
        // Auto-configure settings based on example requirements
        const newSettings = { ...settings };
        
        if (example.requiresThinking) {
            newSettings.thinkingConfig.enabled = true;
            newSettings.thinkingConfig.budget = example.title.includes('Complex') ? 16384 : 8192;
        }
        
        if (example.requiresTools) {
            newSettings.enableTools = true;
        }
        
        if (example.requiresSearch) {
            newSettings.enableSearch = true;
        }
        
        setSettings(newSettings);
        
        // Set the input value
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
            inputElement.value = example.prompt;
            handleInputChange({ target: { value: example.prompt } } as any);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Gemini 2.5 AI SDK Demo
                </h1>
                <p className="text-gray-600">
                    Demonstrates Gemini 2.5 integration with thinking, tools, and search grounding
                </p>
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Configuration</h2>
                
                {/* Model Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gemini 2.5 Model
                    </label>
                    <select
                        value={settings.model}
                        onChange={(e) => handleModelChange(e.target.value as ChatMode)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={ChatMode.GEMINI_2_5_PRO}>
                            {getModelDisplayName(ChatMode.GEMINI_2_5_PRO)}
                        </option>
                        <option value={ChatMode.GEMINI_2_5_FLASH}>
                            {getModelDisplayName(ChatMode.GEMINI_2_5_FLASH)}
                        </option>
                        <option value={ChatMode.GEMINI_2_5_FLASH_LITE}>
                            {getModelDisplayName(ChatMode.GEMINI_2_5_FLASH_LITE)}
                        </option>
                    </select>
                </div>

                {/* Feature Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={settings.thinkingConfig.enabled}
                            onChange={handleThinkingToggle}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            Thinking Mode ({settings.thinkingConfig.budget} tokens)
                        </span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={settings.enableTools}
                            onChange={handleToolsToggle}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Tool Calling</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={settings.enableSearch}
                            onChange={handleSearchToggle}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Google Search</span>
                    </label>
                </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Example Prompts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {examplePrompts.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => handleExamplePrompt(example)}
                            className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                            <div className="font-medium text-blue-800 mb-1">
                                {example.title}
                            </div>
                            <div className="text-xs text-blue-600 mb-2">
                                {example.description}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                                "{example.prompt}"
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-hidden">
                <div className="h-full flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Chat</h2>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <div className="text-4xl mb-2">🤖</div>
                                <div>Start a conversation with Gemini 2.5!</div>
                                <div className="text-sm mt-2">Try one of the example prompts above</div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.role === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <div className="text-sm font-medium mb-1">
                                            {message.role === 'user' ? 'You' : 'Gemini 2.5'}
                                        </div>
                                        <div className="whitespace-pre-wrap">
                                            {typeof message.content === 'string' 
                                                ? message.content 
                                                : JSON.stringify(message.content)
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                                        <span>Gemini is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline ml-2">{error.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Reasoning Display */}
                    {reasoning && settings.thinkingConfig.enabled && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="text-sm font-medium text-yellow-800 mb-2">
                                🧠 Reasoning Process:
                            </div>
                            <div className="text-xs text-yellow-700 max-h-32 overflow-y-auto">
                                {reasoning}
                            </div>
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder={`Ask ${getModelDisplayName(settings.model)}...`}
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 py-2">
                <p>
                    Powered by <strong>Gemini 2.5</strong> and <strong>AI SDK</strong>
                </p>
                <p className="mt-1">
                    Features: Thinking Mode • Tool Calling • Google Search • Real-time Streaming
                </p>
            </div>
        </div>
    );
}