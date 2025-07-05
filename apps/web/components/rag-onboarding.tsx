'use client';

import { useApiKeysStore } from '@repo/common/store';
import { log } from '@repo/shared/logger';
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
                setKey('GEMINI_API_KEY', geminiKey);
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
                if (!open) onSkip();
            }}
            open={isOpen}
        >
            <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="text-muted-foreground h-6 w-6" />
                        Welcome to Knowledge Assistant
                    </DialogTitle>
                </DialogHeader>

                {step === 'welcome' && (
                    <div className="space-y-6">
                        <div className="space-y-4 text-center">
                            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                                <Sparkles className="text-muted-foreground h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-xl font-semibold">Setup Your API Keys</h3>
                                <p className="text-muted-foreground">
                                    To use the Knowledge Assistant, you need to provide your own API
                                    keys. This ensures your data stays private and you have full
                                    control.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <Card className="border-border bg-muted/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <Key className="text-muted-foreground mt-0.5 h-5 w-5" />
                                        <div>
                                            <h4 className="font-medium">
                                                Get Started with Your API Keys
                                            </h4>
                                            <p className="text-muted-foreground text-sm">
                                                Connect your Gemini or OpenAI API keys to start
                                                using the Knowledge Assistant with your personal
                                                data.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border bg-muted/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <Zap className="text-muted-foreground mt-0.5 h-5 w-5" />
                                        <div>
                                            <h4 className="font-medium">Private & Secure</h4>
                                            <p className="text-muted-foreground text-sm">
                                                Your API keys and data stay completely private - we
                                                never store or access your keys.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-center gap-3">
                            <Button onClick={handleSkipForNow} variant="outline">
                                Skip for Now
                            </Button>
                            <Button onClick={() => setStep('api-keys')}>Add API Keys</Button>
                        </div>
                    </div>
                )}

                {step === 'api-keys' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="mb-2 text-xl font-semibold">Connect Your API Keys</h3>
                            <p className="text-muted-foreground">
                                Add at least one API key to unlock unlimited conversations with your
                                knowledge base.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gemini-key">Gemini API Key (Recommended)</Label>
                                <Input
                                    id="gemini-key"
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key..."
                                    type="password"
                                    value={geminiKey}
                                />
                                <p className="text-muted-foreground text-xs">
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
                                <Label htmlFor="openai-key">OpenAI API Key (Optional)</Label>
                                <Input
                                    id="openai-key"
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="Enter your OpenAI API key..."
                                    type="password"
                                    value={openaiKey}
                                />
                                <p className="text-muted-foreground text-xs">
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

                        <div className="flex justify-center gap-3">
                            <Button onClick={() => setStep('welcome')} variant="outline">
                                Back
                            </Button>
                            <Button disabled={isSubmitting} onClick={handleSubmitKeys}>
                                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
