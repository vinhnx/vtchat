'use client';

import { ModelEnum, models } from '@repo/ai/models';
import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
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
    openrouter: 'OpenRouter',
    fireworks: 'Fireworks AI',
    xai: 'xAI',
};

export const ModelSettings = () => {
    const isVtPlus = useVtPlusAccess();
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
            case 'openrouter':
                return !!apiKeys.OPENROUTER_API_KEY;
            case 'fireworks':
                return !!apiKeys.FIREWORKS_API_KEY;
            case 'xai':
                return !!apiKeys.XAI_API_KEY;
            default:
                return false;
        }
    };

    // Check if model is accessible
    const isModelAccessible = (model: (typeof models)[0]): boolean => {
        // Free models are always accessible
        if (model.isFree) return true;

        if (model.provider === 'google') {
            if (model.id === ModelEnum.GEMINI_3_FLASH_LITE) {
                return hasApiKeyForProvider('google');
            }

            // VT+ users get access to managed Gemini usage for higher tier models
            if (isVtPlus) return true;

            return hasApiKeyForProvider('google');
        }

        // For all other models, check if user has the appropriate API key
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
                        VT supports multiple AI providers with a generous free tier and BYOK options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='bg-muted/20 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>Free Models</div>
                            <div className='text-muted-foreground text-sm'>
                                <ul className='list-disc space-y-1 pl-5'>
                                    <li>Qwen3 14B (via OpenRouter community tier)</li>
                                    <li>Local models via Ollama or LM Studio</li>
                                    <li>Gemini 3 Flash Lite (BYOK required for all users)</li>
                                </ul>
                            </div>
                        </div>
                        <div className='bg-muted/20 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>VT+ Benefits</div>
                            <div className='text-muted-foreground text-sm'>
                                <ul className='list-disc space-y-1 pl-5'>
                                    <li>Enhanced Gemini model limits for managed server usage</li>
                                    <li>
                                        BYOK flexibility for Google models, including Flash Lite
                                    </li>
                                    <li>Access to all premium research features</li>
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
                            {!hasApiKeyForProvider(provider) && provider !== 'openrouter' && (
                                <Badge variant='outline' className='text-xs font-normal'>
                                    {'API Key Required'}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {provider === 'google'
                                && 'Gemini models require your own API key for Flash Lite access'}
                            {provider === 'openai'
                                && 'Advanced reasoning and function calling capabilities'}
                            {provider === 'anthropic' && 'Claude models with exceptional reasoning'}
                            {provider === 'openrouter'
                                && 'Access to multiple open models through one API'}
                            {provider === 'fireworks' && 'High-performance model hosting'}
                            {provider === 'xai' && 'Grok models with real-time web access'}
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
                                            {model.isFree && (
                                                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                                                    Free
                                                </Badge>
                                            )}
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
                                        {!isModelAccessible(model) && provider !== 'google' && (
                                            <div className='text-xs italic'>
                                                Add {providerNames[provider]} API key to access
                                            </div>
                                        )}
                                        {!isModelAccessible(model)
                                            && provider === 'google'
                                            && !isVtPlus && (
                                            <div className='text-xs italic'>
                                                Add Google API key or upgrade to VT+
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
                    <CardDescription>How to access different model types in VT</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='bg-background/50 border-muted rounded-lg border p-4'>
                            <div className='text-foreground mb-2 font-medium'>Free Models</div>
                            <div className='text-muted-foreground text-sm'>
                                <p className='mb-2'>
                                    Select OpenRouter models (like Qwen3 14B) remain available to
                                    all registered users without an API key.
                                </p>
                                <p>
                                    Gemini 3 Flash Lite now requires your own Gemini API key for
                                    every request, regardless of subscription tier.
                                </p>
                            </div>
                        </div>

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
                                    VT+ subscribers receive enhanced Gemini rate limits with
                                    server-managed usage for premium tiers. Flash Lite still
                                    respects your BYOK configuration to keep costs predictable.
                                </p>
                                <p>
                                    VT+ also includes exclusive research features like Deep Research
                                    and Pro Search.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
