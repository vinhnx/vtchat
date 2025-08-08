"use client";

import {
    AccessibilitySettings,
    ApiKeySettings,
    CombinedSubscriptionSettings,
    MultiModelUsageMeter,
    PersonalizationSettings,
    UserProfileSettings,
} from "@repo/common/components";
import { SETTING_TABS } from "@repo/common/store";
import { useSession } from "@repo/shared/lib/auth-client";
// Additional imports for mobile navigation
import {
    Button,
    cn,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@repo/ui";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CacheManagement } from "../../components/cache-management";

export function SettingsContent() {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    // Set default tab based on URL parameter
    const getDefaultTab = () => {
        if (tabParam === "profile") return SETTING_TABS.PROFILE;
        return SETTING_TABS.ACCESSIBILITY;
    };

    const [activeTab, setActiveTab] = useState<string>(getDefaultTab());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Update active tab when URL parameter changes
    useEffect(() => {
        if (tabParam === "profile") {
            setActiveTab(SETTING_TABS.PROFILE);
        }
    }, [tabParam]);

    // Show login required message if not signed in
    if (!isSignedIn) {
        return (
            <div className="mx-auto max-w-2xl text-center">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Sign in required</h2>
                    <p className="text-muted-foreground">
                        You need to be signed in to access your settings.
                    </p>
                    <a
                        href="/login?redirect=/settings"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
                    >
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    const settingTabs = [
        {
            id: SETTING_TABS.ACCESSIBILITY,
            label: "Accessibility",
            description: "Accessibility and motion preferences",
            component: <AccessibilitySettings />,
        },
        {
            id: SETTING_TABS.USAGE_CREDITS,
            label: "VT+",
            description: "Premium features and usage management",
            component: <CombinedSubscriptionSettings onClose={() => {}} />,
        },
        {
            id: SETTING_TABS.USAGE,
            label: "Usage",
            description: "View your LLMs usage",
            component: <MultiModelUsageMeter userId={session?.user?.id} />,
        },
        {
            id: SETTING_TABS.PROFILE,
            label: "Profile",
            description: "Manage your account details",
            component: <UserProfileSettings />,
        },
        {
            id: SETTING_TABS.PERSONALIZATION,
            label: "Preferences",
            description: "Customize your VT experience",
            component: <PersonalizationSettings onClose={() => {}} />,
        },
        {
            id: SETTING_TABS.API_KEYS,
            label: "API Keys",
            description: "Connect your own AI providers",
            component: <ApiKeySettings />,
        },
        {
            id: SETTING_TABS.CACHE,
            label: "Cache & Offline",
            description: "Manage app cache and offline features",
            component: <CacheManagement />,
        },
    ];

    return (
        <div className="mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Horizontal tabs for mobile, vertical for desktop */}
                <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:gap-8">
                    {/* Sidebar Navigation */}
                    <div className="flex-shrink-0 lg:w-72 xl:w-80">
                        {/* Mobile Dropdown */}
                        <div className="mb-6 lg:hidden">
                            <div className="sticky top-4 z-[50]">
                                <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={mobileMenuOpen}
                                            className="bg-background/95 w-full justify-between border shadow-sm backdrop-blur-sm"
                                        >
                                            {settingTabs.find((tab) => tab.id === activeTab)?.label}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="z-[60] w-[var(--radix-popover-trigger-width)] p-0"
                                        align="start"
                                        sideOffset={4}
                                    >
                                        <div className="max-h-[60vh] overflow-auto">
                                            {settingTabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "hover:bg-muted/50 w-full px-4 py-3 text-left transition-colors",
                                                        "border-border/50 border-b last:border-b-0",
                                                        activeTab === tab.id && "bg-muted",
                                                    )}
                                                >
                                                    <div className="text-sm font-medium">
                                                        {tab.label}
                                                    </div>
                                                    <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                                                        {tab.description}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Desktop Sidebar */}
                        <TabsList className="hidden lg:grid lg:h-auto lg:grid-cols-1 lg:space-y-1 lg:bg-transparent lg:p-0">
                            {settingTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "h-auto min-h-[3.5rem] w-full justify-start rounded-lg p-3 text-left lg:min-h-[4rem] lg:p-4",
                                        "data-[state=active]:bg-muted data-[state=active]:shadow-sm",
                                        "hover:bg-muted/50 data-[state=inactive]:bg-transparent",
                                        "transition-all duration-200",
                                    )}
                                >
                                    <div className="flex w-full flex-col items-start">
                                        <div className="text-sm font-medium lg:text-base">
                                            {tab.label}
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                            {tab.description}
                                        </div>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Main Content */}
                    <div className="min-w-0 flex-1">
                        {settingTabs.map((tab) => (
                            <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-6">
                                <div className="bg-background rounded-lg border p-4 shadow-sm md:p-6">
                                    {tab.component}
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
