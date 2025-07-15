"use client";

import { ModelEnum, models } from "@repo/ai/models";
import {
    useCreemSubscription,
    useCurrentPlan,
    useFeatureAccess,
    useVtPlusAccess,
} from "@repo/common/hooks";
import { useAppStore } from "@repo/common/store";
import {
    DEFAULT_EMBEDDING_MODEL,
    EMBEDDING_MODEL_CONFIG,
} from "@repo/shared/config/embedding-models";
import { getEnabledVTPlusFeatures, VT_PLUS_FEATURES } from "@repo/shared/config/vt-plus-features";
import { BUTTON_TEXT, THINKING_MODE, VT_PLUS_PRICE_WITH_INTERVAL } from "@repo/shared/constants";
import { log } from "@repo/shared/logger";
import { FeatureSlug, PLANS, PlanSlug } from "@repo/shared/types/subscription";
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Skeleton,
    Slider,
    Switch,
    Textarea,
    TypographyH3,
    TypographyMuted,
} from "@repo/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    ArrowRight,
    BarChart3,
    Brain,
    Check,
    CreditCard,
    Database,
    FileText,
    Lock,
    MessageSquare,
    Palette,
    Search,
    Settings,
    Shield,
    Sparkles,
    Trash2,
    User,
    Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Combobox } from "./combobox";
import { PaymentRedirectLoader } from "./payment-redirect-loader";
import { UserTierBadge } from "./user-tier-badge";
import { VtPlusUsageMeter } from "./vtplus-usage-meter";

interface CombinedSubscriptionSettingsProps {
    onClose?: () => void;
}

export function CombinedSubscriptionSettings({ onClose }: CombinedSubscriptionSettingsProps) {
    const isVtPlus = useVtPlusAccess();
    const { planSlug, isLoaded } = useCurrentPlan();
    const {
        openCustomerPortal,
        isPortalLoading,
        isLoading: isPaymentLoading,
    } = useCreemSubscription();

    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);
    const hasGeminiCachingAccess = useFeatureAccess(FeatureSlug.GEMINI_EXPLICIT_CACHING);
    const thinkingMode = useAppStore((state) => state.thinkingMode);
    const setThinkingMode = useAppStore((state) => state.setThinkingMode);
    const geminiCaching = useAppStore((state) => state.geminiCaching);
    const setGeminiCaching = useAppStore((state) => state.setGeminiCaching);
    const embeddingModel = useAppStore((state) => state.embeddingModel);
    const setEmbeddingModel = useAppStore((state) => state.setEmbeddingModel);
    const ragChatModel = useAppStore((state) => state.ragChatModel);
    const setRagChatModel = useAppStore((state) => state.setRagChatModel);
    const profile = useAppStore((state) => state.profile);
    const setProfile = useAppStore((state) => state.setProfile);

    // Auto-fill suggestions from knowledge base
    const [knowledgeBaseSuggestions, setKnowledgeBaseSuggestions] = useState<{
        name: string;
        work: string;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Ensure embeddingModel is valid, reset to default if not
    const safeEmbeddingModel = EMBEDDING_MODEL_CONFIG[embeddingModel]
        ? embeddingModel
        : DEFAULT_EMBEDDING_MODEL;

    const currentPlan = planSlug && PLANS[planSlug] ? PLANS[planSlug] : PLANS[PlanSlug.VT_BASE];
    const vtPlusFeatures = getEnabledVTPlusFeatures();

    // Function to analyze knowledge base and suggest profile information
    const analyzeKnowledgeBase = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/agent/knowledge");
            if (response.ok) {
                const data = await response.json();
                const resources = data.resources || data.knowledge || [];

                if (resources.length > 0) {
                    // Simple analysis to extract potential name and work info
                    const allContent = resources.map((r: any) => r.content).join(" ");

                    // Look for patterns like "I'm [name]", "My name is [name]", "call me [name]"
                    const namePatterns = [
                        /(?:I'm|I am|call me|my name is|i'm|i am)\s+([A-Z][a-z]+)/gi,
                        /(?:this is|here's|i'm)\s+([A-Z][a-z]+)/gi,
                    ];

                    let suggestedName = "";
                    for (const pattern of namePatterns) {
                        const match = pattern.exec(allContent);
                        if (match?.[1] && !["The", "A", "An", "This", "That"].includes(match[1])) {
                            suggestedName = match[1];
                            break;
                        }
                    }

                    // Look for work-related patterns
                    const workPatterns = [
                        /(?:I work as|I'm a|I am a|my job is|I do)\s+([^.!?]+)/gi,
                        /(?:software engineer|developer|manager|designer|student|teacher|doctor|nurse|analyst|consultant|freelancer|entrepreneur|founder|CEO|CTO|VP|director)/gi,
                        /(?:at [A-Z][a-z]+ [A-Z][a-z]+|at [A-Z][a-z]+)/gi,
                    ];

                    let suggestedWork = "";
                    for (const pattern of workPatterns) {
                        const match = pattern.exec(allContent);
                        if (match) {
                            suggestedWork = match[0].trim();
                            if (suggestedWork.length > 100) {
                                suggestedWork = `${suggestedWork.substring(0, 100)}...`;
                            }
                            break;
                        }
                    }

                    if (suggestedName || suggestedWork) {
                        setKnowledgeBaseSuggestions({
                            name: suggestedName,
                            work: suggestedWork,
                        });
                    }
                }
            }
        } catch (error) {
            log.error({ error }, "Error analyzing knowledge base");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Auto-analyze on mount if profile is empty
    React.useEffect(() => {
        if (isVtPlus && !profile.name && !profile.workDescription) {
            analyzeKnowledgeBase();
        }
    }, [isVtPlus, profile.name, profile.workDescription]);

    const setThinkingModeEnabled = (enabled: boolean) => {
        setThinkingMode({
            enabled,
        });
    };

    const setThinkingModeIncludeThoughts = (includeThoughts: boolean) => {
        setThinkingMode({
            includeThoughts,
        });
    };

    const getFeatureDetails = (featureId: FeatureSlug) => {
        switch (featureId) {
            case FeatureSlug.DOCUMENT_PARSING:
                return {
                    icon: <FileText className="h-4 w-4" />,
                    benefit: "Upload and analyze documents",
                    description:
                        "Process PDFs, Word docs, spreadsheets, and other files directly in chat. Extract insights, summarize content, and ask questions about your documents.",
                };
            case FeatureSlug.STRUCTURED_OUTPUT:
                return {
                    icon: <MessageSquare className="h-4 w-4" />,
                    benefit: "Organized, structured responses",
                    description:
                        "Get AI responses in clean tables, bullet points, numbered lists, and other organized formats for better readability and usability.",
                };
            case FeatureSlug.THINKING_MODE_TOGGLE:
                return {
                    icon: <Brain className="h-4 w-4" />,
                    benefit: "AI reasoning transparency",
                    description:
                        "See exactly how the AI thinks through problems step-by-step. Understand the reasoning process for better learning and trust.",
                };
            case FeatureSlug.REASONING_CHAIN:
                return {
                    icon: <Activity className="h-4 w-4" />,
                    benefit: "Step-by-step problem solving",
                    description:
                        "Watch AI break down complex problems into logical steps, showing the chain of reasoning for transparent decision making.",
                };
            case FeatureSlug.PRO_SEARCH:
                return {
                    icon: <Search className="h-4 w-4" />,
                    benefit: "Advanced web search integration",
                    description:
                        "Get real-time information from the web with intelligent search capabilities that understand context and provide accurate results.",
                };
            case FeatureSlug.DEEP_RESEARCH:
                return {
                    icon: <Shield className="h-4 w-4" />,
                    benefit: "Comprehensive research tools",
                    description:
                        "Conduct thorough research across multiple sources with AI-powered analysis, fact-checking, and synthesis of information.",
                };
            case FeatureSlug.DARK_THEME:
                return {
                    icon: <Palette className="h-4 w-4" />,
                    benefit: "Comfortable dark mode",
                    description:
                        "Beautiful dark theme designed for extended use, reducing eye strain during long sessions and late-night work.",
                };
            case FeatureSlug.GEMINI_EXPLICIT_CACHING:
                return {
                    icon: <Zap className="h-4 w-4" />,
                    benefit: "Cost-effective Gemini caching",
                    description:
                        "Reduce API costs for Gemini 2.5 and 2.0 models by reusing conversation context across multiple queries.",
                };
            case FeatureSlug.CHART_VISUALIZATION:
                return {
                    icon: <BarChart3 className="h-4 w-4" />,
                    benefit: "Interactive chart generation",
                    description:
                        "Create beautiful interactive charts and graphs directly from AI conversations. Visualize data with bar charts, line charts, pie charts, and more.",
                };
            default:
                return {
                    icon: <Sparkles className="h-4 w-4" />,
                    benefit: "Enhanced AI capabilities",
                    description:
                        "Premium features that unlock the full potential of AI assistance.",
                };
        }
    };

    const handleManageSubscription = async () => {
        try {
            await openCustomerPortal();
        } catch (error) {
            log.error({ error }, "Failed to open subscription portal");
        }
    };

    const handleUpgradeToPlus = () => {
        onClose?.();
        window.location.href = "/pricing";
    };

    return (
        <>
            <PaymentRedirectLoader isLoading={isPaymentLoading || isPortalLoading} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div>
                        <TypographyH3>VT+</TypographyH3>
                        <TypographyMuted>
                            Premium features and subscription management
                        </TypographyMuted>
                    </div>
                </div>

                {/* Current Plan & Billing Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Plan & Billing
                        </CardTitle>
                        <CardDescription>
                            Your subscription details and billing management
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-foreground text-lg font-semibold">
                                                {currentPlan.name}
                                            </div>
                                            <UserTierBadge />
                                        </div>
                                    </div>
                                </div>
                                {isLoaded ? (
                                    <div className="shrink-0">
                                        {isVtPlus ? (
                                            <Button
                                                disabled={isPortalLoading}
                                                onClick={handleManageSubscription}
                                                size="sm"
                                                variant="outline"
                                            >
                                                {isPortalLoading
                                                    ? BUTTON_TEXT.LOADING
                                                    : BUTTON_TEXT.MANAGE_BILLING}
                                            </Button>
                                        ) : (
                                            <Button onClick={handleUpgradeToPlus} size="sm">
                                                Upgrade to VT+
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="shrink-0">
                                        <Skeleton className="h-9 w-28 rounded-md" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* VT+ Features Section - Only show if user has VT+ */}
                {hasThinkingModeAccess && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Thinking Mode
                            </CardTitle>
                            <CardDescription>
                                Advanced reasoning mode that shows AI thought process for better
                                understanding
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <Label
                                                className="cursor-pointer text-sm font-medium"
                                                htmlFor="thinking-mode"
                                            >
                                                Enable Thinking Mode
                                            </Label>
                                            <div className="text-muted-foreground text-xs">
                                                Show detailed reasoning process in responses
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={thinkingMode.enabled}
                                        id="thinking-mode"
                                        onCheckedChange={setThinkingModeEnabled}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {thinkingMode.enabled && (
                                    <motion.div
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-4"
                                        exit={{ opacity: 0, height: 0 }}
                                        initial={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Include Thoughts Toggle */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            className="cursor-pointer text-sm font-medium"
                                                            htmlFor="include-thoughts"
                                                        >
                                                            Show Thought Process
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            Display internal reasoning steps in chat
                                                        </div>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={thinkingMode.includeThoughts}
                                                    id="include-thoughts"
                                                    onCheckedChange={setThinkingModeIncludeThoughts}
                                                />
                                            </div>
                                        </div>

                                        {/* Thinking Budget Slider */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                                        <Activity className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-sm font-medium">
                                                            Thinking Budget: {thinkingMode.budget}
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            Higher values allow deeper reasoning
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    className="w-full"
                                                    max={THINKING_MODE.MAX_BUDGET}
                                                    min={THINKING_MODE.MIN_BUDGET}
                                                    onValueChange={([value]) =>
                                                        setThinkingMode({
                                                            budget: value,
                                                        })
                                                    }
                                                    step={256}
                                                    value={[thinkingMode.budget]}
                                                />
                                                <div className="text-muted-foreground flex justify-between text-xs">
                                                    <span>Quick ({THINKING_MODE.MIN_BUDGET})</span>
                                                    <span>Deep ({THINKING_MODE.MAX_BUDGET})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                )}

                {/* Gemini Explicit Caching Section - Only show if user has VT+ */}
                {hasGeminiCachingAccess && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Gemini Explicit Caching
                            </CardTitle>
                            <CardDescription>
                                Cost-effective caching for Gemini 2.5 and 2.0 models to reduce API
                                costs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <Label
                                                className="cursor-pointer text-sm font-medium"
                                                htmlFor="gemini-caching"
                                            >
                                                Enable Explicit Caching
                                            </Label>
                                            <div className="text-muted-foreground text-xs">
                                                Cache conversation context to reduce API costs
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={geminiCaching.enabled}
                                        id="gemini-caching"
                                        onCheckedChange={(enabled) => setGeminiCaching({ enabled })}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {geminiCaching.enabled && (
                                    <motion.div
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-4"
                                        exit={{ opacity: 0, height: 0 }}
                                        initial={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Cache TTL Slider */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-sm font-medium">
                                                            Cache Duration:{" "}
                                                            {Math.round(
                                                                geminiCaching.ttlSeconds / 60,
                                                            )}{" "}
                                                            minutes
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            How long to keep cached conversations
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    className="w-full"
                                                    max={3600}
                                                    min={60} // 1 minute
                                                    onValueChange={([value]) =>
                                                        setGeminiCaching({
                                                            ttlSeconds: value,
                                                        })
                                                    } // 1 hour
                                                    step={60}
                                                    value={[geminiCaching.ttlSeconds]}
                                                />
                                                <div className="text-muted-foreground flex justify-between text-xs">
                                                    <span>1 minute</span>
                                                    <span>60 minutes</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Max Caches Setting */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                                        <Activity className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-sm font-medium">
                                                            Max Cached Conversations:{" "}
                                                            {geminiCaching.maxCaches}
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            Maximum number of conversations to cache
                                                            simultaneously
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    className="w-full"
                                                    max={20}
                                                    min={1}
                                                    onValueChange={([value]) =>
                                                        setGeminiCaching({
                                                            maxCaches: value,
                                                        })
                                                    }
                                                    step={1}
                                                    value={[geminiCaching.maxCaches]}
                                                />
                                                <div className="text-muted-foreground flex justify-between text-xs">
                                                    <span>1 conversation</span>
                                                    <span>20 conversations</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                )}

                {/* Personal AI Assistant Profile Settings */}
                {isVtPlus && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <User className="h-5 w-5" />
                                Personal AI Assistant Profile
                                <Badge
                                    className="bg-blue-100 text-xs text-blue-800"
                                    variant="secondary"
                                >
                                    Beta
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Help your AI assistant understand you better. This information is
                                stored locally and never shared with third parties.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="profile-name">
                                    What should your AI assistant call you?
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        className="w-full"
                                        id="profile-name"
                                        onChange={(e) => setProfile({ name: e.target.value })}
                                        placeholder="e.g., Alex, Dr. Smith, or your preferred name"
                                        value={profile.name}
                                    />
                                    {knowledgeBaseSuggestions?.name && !profile.name && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Found in your knowledge:
                                            </span>
                                            <Button
                                                className="h-6 px-2 text-xs"
                                                onClick={() =>
                                                    setProfile({
                                                        name: knowledgeBaseSuggestions.name,
                                                    })
                                                }
                                                size="sm"
                                                variant="outline"
                                            >
                                                Use "{knowledgeBaseSuggestions.name}"
                                            </Button>
                                        </div>
                                    )}
                                    {isAnalyzing && (
                                        <div className="text-muted-foreground text-xs">
                                            Analyzing your knowledge base for suggestions...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profile-work">What best describes your work?</Label>
                                <div className="space-y-2">
                                    <Textarea
                                        className="min-h-[80px] w-full resize-none"
                                        id="profile-work"
                                        maxLength={500}
                                        onChange={(e) =>
                                            setProfile({ workDescription: e.target.value })
                                        }
                                        placeholder="e.g., Software engineer at a fintech startup, Marketing manager in healthcare, Student studying computer science..."
                                        value={profile.workDescription}
                                    />
                                    {knowledgeBaseSuggestions?.work && !profile.workDescription && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Found in your knowledge:
                                            </span>
                                            <Button
                                                className="h-6 px-2 text-xs"
                                                onClick={() =>
                                                    setProfile({
                                                        workDescription:
                                                            knowledgeBaseSuggestions.work,
                                                    })
                                                }
                                                size="sm"
                                                variant="outline"
                                            >
                                                Use "
                                                {knowledgeBaseSuggestions.work.length > 30
                                                    ? `${knowledgeBaseSuggestions.work.substring(
                                                          0,
                                                          30,
                                                      )}...`
                                                    : knowledgeBaseSuggestions.work}
                                                "
                                            </Button>
                                        </div>
                                    )}
                                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                                        <span>
                                            This helps your AI provide more relevant and
                                            personalized responses
                                        </span>
                                        <span>{profile.workDescription.length}/500</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Alert className="flex-1">
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Privacy Notice:</strong> This information is stored
                                        locally on your device and is not shared with any third
                                        parties. It's only used to enhance your experience with your
                                        Personal AI Assistant.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            {/* Re-analyze button */}
                            <div className="flex justify-center pt-2">
                                <Button
                                    className="text-xs"
                                    disabled={isAnalyzing}
                                    onClick={analyzeKnowledgeBase}
                                    size="sm"
                                    variant="outline"
                                >
                                    {isAnalyzing ? "Analyzing..." : "Re-analyze Agent"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Agent Management */}
                {isVtPlus && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Database className="h-5 w-5" />
                                Agent Management
                            </CardTitle>
                            <CardDescription>
                                Manage your Personal AI Assistant's knowledge base. View stored
                                information or clear all data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        // Open the AI Assistant page to view knowledge base
                                        window.open("/agent", "_blank");
                                    }}
                                    variant="outline"
                                >
                                    <Database className="mr-2 h-4 w-4" />
                                    View Agent
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={async () => {
                                        if (
                                            confirm(
                                                "Are you sure you want to clear all knowledge base data? This action cannot be undone.",
                                            )
                                        ) {
                                            try {
                                                const response = await fetch("/api/agent/clear", {
                                                    method: "DELETE",
                                                });
                                                if (response.ok) {
                                                    alert("Knowledge base cleared successfully");
                                                } else {
                                                    alert("Failed to clear knowledge base");
                                                }
                                            } catch (error) {
                                                log.error(
                                                    { error },
                                                    "Error clearing knowledge base",
                                                );
                                                alert("Error clearing knowledge base");
                                            }
                                        }
                                    }}
                                    variant="destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All Data
                                </Button>
                            </div>
                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Data Safety:</strong> All knowledge base operations are
                                    performed securely with your personal data isolated from other
                                    users.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}

                {/* Personal AI Assistant Embedding Model Selection */}
                {isVtPlus && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Database className="h-5 w-5" />
                                Personal AI Assistant Embedding Model
                            </CardTitle>
                            <CardDescription>
                                Choose which AI model to use for generating embeddings in your
                                Personal AI Assistant knowledge base. Different models may provide
                                varying quality and performance characteristics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="text-foreground text-sm font-medium">
                                            Embedding Provider
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {EMBEDDING_MODEL_CONFIG[safeEmbeddingModel].description}
                                        </div>
                                    </div>
                                    <Combobox
                                        className="w-full"
                                        onValueChange={(value) => setEmbeddingModel(value as any)}
                                        options={Object.entries(EMBEDDING_MODEL_CONFIG).map(
                                            ([key, config]) => ({
                                                value: key,
                                                label: config.name,
                                                description: `${config.provider} • ${config.dimensions}D`,
                                            }),
                                        )}
                                        placeholder="Select embedding model..."
                                        searchPlaceholder="Search models..."
                                        value={safeEmbeddingModel}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Personal AI Assistant Chat Model Selection */}
                {isVtPlus && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Settings className="h-5 w-5" />
                                Personal AI Assistant Chat Model
                            </CardTitle>
                            <CardDescription>
                                Choose which AI model to use for conversations in your Personal AI
                                Assistant chat. Different models may provide varying quality, speed,
                                and capabilities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="text-foreground text-sm font-medium">
                                            Chat Model
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {models.find((m) => m.id === ragChatModel)?.name ||
                                                "Unknown Model"}
                                        </div>
                                    </div>
                                    <Combobox
                                        className="w-full"
                                        onValueChange={(value) =>
                                            setRagChatModel(value as ModelEnum)
                                        }
                                        options={models
                                            .filter((model) =>
                                                // Filter to show commonly used models for RAG
                                                [
                                                    ModelEnum.GPT_4o,
                                                    ModelEnum.GPT_4o_Mini,
                                                    ModelEnum.CLAUDE_4_SONNET,
                                                    ModelEnum.CLAUDE_4_OPUS,
                                                    ModelEnum.GEMINI_2_5_PRO,
                                                    ModelEnum.GEMINI_2_5_FLASH,
                                                    ModelEnum.GEMINI_2_5_FLASH_LITE,
                                                ].includes(model.id),
                                            )
                                            .map((model) => ({
                                                value: model.id,
                                                label: model.name,
                                                description: `${model.provider} • ${model.contextWindow} tokens`,
                                            }))}
                                        placeholder="Select chat model..."
                                        searchPlaceholder="Search models..."
                                        value={ragChatModel}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* VT+ Usage Tracking for VT+ Users */}
                {isVtPlus && (
                    <Card>
                        <CardContent className="pt-6">
                            <VtPlusUsageMeter userId={profile?.auth?.user?.id} />
                        </CardContent>
                    </Card>
                )}

                {/* Simple Upgrade Promotion for Free Users */}
                {!isVtPlus && (
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                            <strong>Ready to upgrade?</strong> Get VT+ for{" "}
                            {VT_PLUS_PRICE_WITH_INTERVAL} with free trial included and cancel
                            anytime. Unlock premium AI models, research capabilities, and AI memory.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    );
}
