'use client';

import { useApiKeysStore } from '@repo/common/store';
import { log } from '@repo/shared/logger';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from '@repo/ui';
import { Brain, Key, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RagOnboardingProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export function RagOnboarding({ isOpen, onComplete, onSkip }: RagOnboardingProps) {
    const [step, setStep] = useState<'welcome' | 'api-keys'>('welcome');
    const [geminiKey, setGeminiKey] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { setKey } = useApiKeysStore();

    const handleSubmitKeys = async () => {
        if (!(geminiKey || openaiKey)) {
            toast.error('Please enter at least one API key');
            return;
        }

        setIsSubmitting(true);
        try {
            if (geminiKey) {
                setKey(API_KEY_NAMES.GOOGLE, geminiKey);
            }
            if (openaiKey) {
                setKey('OPENAI_API_KEY', openaiKey);
            }

            toast.success(
                'All Set! Your Knowledge Assistant is ready. Start building your personal knowledge base!'
            );
            onComplete();
        } catch (error) {
            log.error({ error }, 'Error saving API keys');
            toast.error('Failed to save API keys');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipForNow = () => {
        toast.info('You can add API keys anytime in Settings to use the Knowledge Assistant');
        onSkip();
    };

    return (
        <Dialog
            onOpenChange={(open) => {
                if (!open) {
                    onSkip();
                }
            }}
            open={isOpen}
            modal={true}
        >
            <DialogContent
                className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl p-3 sm:p-6"
                onPointerDownOutside={(e) => {
                    e.preventDefault();
                    onSkip();
                }}
                onEscapeKeyDown={(e) => {
                    e.preventDefault();
                    onSkip();
                }}
            >
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Brain className="text-muted-foreground h-5 w-5 sm:h-6 sm:w-6" />
                        Welcome to Knowledge Assistant
                    </DialogTitle>
                </DialogHeader>

                {step === 'welcome' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-3 sm:space-y-4 text-center">
                            <div className="bg-muted mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full">
                                <Sparkles className="text-muted-foreground h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-lg sm:text-xl font-semibold">
                                    Setup Your API Keys
                                </h3>
                                <p className="text-muted-foreground text-sm sm:text-base px-2 sm:px-0">
                                    To use the Knowledge Assistant, you need to provide your own API
                                    keys. This ensures your data stays private and you have full
                                    control.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:gap-4">
                            <Card className="border-border bg-muted/30">
                                <CardContent className="pt-3 sm:pt-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Key className="text-muted-foreground mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm sm:text-base">
                                                Get Started with Your API Keys
                                            </h4>
                                            <p className="text-muted-foreground text-xs sm:text-sm">
                                                Connect your Gemini or OpenAI API keys to start
                                                using the Knowledge Assistant with your personal
                                                data.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border bg-muted/30">
                                <CardContent className="pt-3 sm:pt-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Zap className="text-muted-foreground mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm sm:text-base">
                                                Private & Secure
                                            </h4>
                                            <p className="text-muted-foreground text-xs sm:text-sm">
                                                Your API keys and data stay completely private - we
                                                never store or access your keys.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                            <Button
                                onClick={handleSkipForNow}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                Skip for Now
                            </Button>
                            <Button
                                onClick={() => setStep('api-keys')}
                                className="w-full sm:w-auto"
                            >
                                Add API Keys
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'api-keys' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg sm:text-xl font-semibold">
                                Connect Your API Keys
                            </h3>
                            <p className="text-muted-foreground text-sm sm:text-base px-2 sm:px-0">
                                Add at least one API key to unlock unlimited conversations with your
                                knowledge base.
                            </p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gemini-key" className="text-sm sm:text-base">
                                    Gemini API Key (Recommended)
                                </Label>
                                <Input
                                    id="gemini-key"
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key..."
                                    type="password"
                                    value={geminiKey}
                                    className="text-sm sm:text-base"
                                />
                                <p className="text-muted-foreground text-xs sm:text-sm">
                                    Get your free API key from{' '}
                                    <a
                                        className="text-blue-600 hover:underline"
                                        href="https://aistudio.google.com/app/apikey"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        Google AI Studio
                                    </a>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="openai-key" className="text-sm sm:text-base">
                                    OpenAI API Key (Optional)
                                </Label>
                                <Input
                                    id="openai-key"
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="Enter your OpenAI API key..."
                                    type="password"
                                    value={openaiKey}
                                    className="text-sm sm:text-base"
                                />
                                <p className="text-muted-foreground text-xs sm:text-sm">
                                    Get your API key from{' '}
                                    <a
                                        className="text-blue-600 hover:underline"
                                        href="https://platform.openai.com/api-keys"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        OpenAI Platform
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                            <Button
                                onClick={() => setStep('welcome')}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                Back
                            </Button>
                            <Button
                                disabled={isSubmitting}
                                onClick={handleSubmitKeys}
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
