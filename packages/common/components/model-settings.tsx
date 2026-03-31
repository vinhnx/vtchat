'use client';

import { models } from '@repo/ai/models';
import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { useApiKeysStore } from '../store/api-keys.store';

// Group models by provider
const groupModelsByProvider = () => {
    const groupedModels: Record<string, typeof models> = {};

    models.forEach((model) => {
        if (!groupedModels[model.provider]) {
            groupedModels[model.provider] = [];
        }
        groupedModels[model.provider].push(model);
    });

    return groupedModels;
};

// Provider display names
const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
};

export const ModelSettings = () => {
    const apiKeys = useApiKeysStore((state) => state.getAllKeys());
    const groupedModels = groupModelsByProvider();

    // Check if user has API key for a provider
    const hasApiKeyForProvider = (provider: string): boolean => {
        switch (provider) {
            case 'openai':
                return !!apiKeys.OPENAI_API_KEY;
            case 'anthropic':
                return !!apiKeys.ANTHROPIC_API_KEY;
            case 'google':
                return !!apiKeys.GEMINI_API_KEY;
            default:
                return false;
        }
    };

    // Check if model is accessible
    const isModelAccessible = (model: (typeof models)[0]): boolean => {
        if (model.provider === 'google') {
            // All Gemini models require BYOK
            return hasApiKeyForProvider('google');
        }

        // For other models, check if user has the appropriate API key
        return hasApiKeyForProvider(model.provider);
    };

    return (
        <div className='w-full space-y-6'>
            {/* Header */}
            <div>
                <TypographyH3 className='text-lg md:text-xl'>AI Models</TypographyH3>
                <TypographyMuted className='text-sm md:text-base'>
                    View all available AI models and their access status
                </TypographyMuted>
            </div>

            {/* Models Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-foreground'>Models Overview</CardTitle>
                    <CardDescription>
                        VT supports multiple AI providers with BYOK (Bring Your Own Key)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='bg-muted/20 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>
                                BYOK Required
                            </div>
                            <div className='text-muted-foreground text-sm'>
                                <p className='mb-2'>
                                    All models require your own API keys:
                                </p>
                                <ul className='list-disc space-y-1 pl-5'>
                                    <li>OpenAI API Key for GPT-5.4 series</li>
                                    <li>Anthropic API Key for Claude 4.6/4.5</li>
                                    <li>Google API Key for Gemini 3.x</li>
                                </ul>
                            </div>
                        </div>
                        <div className='bg-muted/20 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>VT+ Benefits</div>
                            <div className='text-muted-foreground text-sm'>
                                <ul className='list-disc space-y-1 pl-5'>
                                    <li>Enhanced Gemini model limits</li>
                                    <li>Access to Deep Research & Pro Search</li>
                                    <li>Priority support and features</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Models by Provider */}
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
                <Card key={provider}>
                    <CardHeader>
                        <CardTitle className='text-foreground flex items-center gap-2'>
                            {providerNames[provider] || provider}
                            {!hasApiKeyForProvider(provider) && (
                                <Badge variant='outline' className='text-xs font-normal'>
                                    API Key Required
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {provider === 'google'
                                && 'Gemini models require your own API key'}
                            {provider === 'openai'
                                && 'Advanced reasoning and function calling capabilities'}
                            {provider === 'anthropic' && 'Claude models with exceptional reasoning'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                            {providerModels.map((model) => (
                                <div
                                    key={model.id}
                                    className={`rounded-lg border p-3 ${
                                        isModelAccessible(model)
                                            ? 'bg-background/80 border-muted'
                                            : 'bg-muted/10 border-muted/50'
                                    }`}
                                >
                                    <div className='mb-2 flex items-start justify-between'>
                                        <div className='text-sm font-medium'>{model.name}</div>
                                        <div className='flex gap-1'>
                                            {isModelAccessible(model)
                                                ? (
                                                    <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
                                                        Available
                                                    </Badge>
                                                )
                                                : (
                                                    <Badge
                                                        variant='outline'
                                                        className='text-muted-foreground'
                                                    >
                                                        Locked
                                                    </Badge>
                                                )}
                                        </div>
                                    </div>
                                    <div className='text-muted-foreground space-y-1 text-xs'>
                                        <div>
                                            Context:{' '}
                                            {(model.contextWindow / 1000).toFixed(0)}K tokens
                                        </div>
                                        {!isModelAccessible(model) && (
                                            <div className='text-xs italic'>
                                                Add {providerNames[provider]} API key to access
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Access Instructions */}
            <Card className='border-muted/50 bg-muted/10'>
                <CardHeader>
                    <CardTitle className='text-foreground'>Access Instructions</CardTitle>
                    <CardDescription>How to access different models in VT</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='bg-background/50 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>
                                BYOK (Bring Your Own Key)
                            </div>
                            <div className='text-muted-foreground text-sm'>
                                <p className='mb-2'>
                                    Add your own API keys in the API Keys section to access all
                                    models from that provider without rate limits.
                                </p>
                                <p>
                                    Your API keys are stored securely in your browser's local
                                    storage and never sent to our servers.
                                </p>
                            </div>
                        </div>

                        <div className='bg-background/50 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>VT+ Subscription</div>
                            <div className='text-muted-foreground text-sm'>
                                <p className='mb-2'>
                                    VT+ subscribers receive enhanced Gemini rate limits and access
                                    to exclusive research features.
                                </p>
                                <p>
                                    VT+ includes Deep Research and Pro Search capabilities for
                                    advanced AI-powered research workflows.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
