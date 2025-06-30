'use client';

import { useApiKeysStore } from '@repo/common/store';
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Label
} from '@repo/ui';
import { useState } from 'react';
import { toast } from 'sonner';
import { Brain, Key, Sparkles, Zap } from 'lucide-react';
import { logger } from '@repo/shared/logger';

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
        if (!geminiKey && !openaiKey) {
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

            toast.success('All Set! Your Knowledge Assistant is ready. Start building your personal knowledge base!');
            onComplete();
        } catch (error) {
            logger.error('Error saving API keys:', { data: error });
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
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-muted-foreground" />
                        Welcome to Knowledge Assistant
                    </DialogTitle>
                </DialogHeader>

                {step === 'welcome' && (
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Setup Your API Keys</h3>
                                <p className="text-muted-foreground">
                                    To use the Knowledge Assistant, you need to provide your own API keys. This ensures your data stays private and you have full control.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <Card className="border-border bg-muted/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h4 className="font-medium">Get Started with Your API Keys</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Connect your Gemini or OpenAI API keys to start using the Knowledge Assistant with your personal data.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border bg-muted/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <Zap className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h4 className="font-medium">Private & Secure</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Your API keys and data stay completely private - we never store or access your keys.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={handleSkipForNow}>
                                Skip for Now
                            </Button>
                            <Button onClick={() => setStep('api-keys')}>
                                Add API Keys
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'api-keys' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Connect Your API Keys</h3>
                            <p className="text-muted-foreground">
                                Add at least one API key to unlock unlimited conversations with your knowledge base.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gemini-key">Gemini API Key (Recommended)</Label>
                                <Input
                                    id="gemini-key"
                                    type="password"
                                    placeholder="Enter your Gemini API key..."
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Get your free API key from{' '}
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Google AI Studio
                                    </a>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="openai-key">OpenAI API Key (Optional)</Label>
                                <Input
                                    id="openai-key"
                                    type="password"
                                    placeholder="Enter your OpenAI API key..."
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Get your API key from{' '}
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        OpenAI Platform
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => setStep('welcome')}>
                                Back
                            </Button>
                            <Button onClick={handleSubmitKeys} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
