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
import { useState } from "react";
import { CacheManagement } from "../../components/cache-management";

export function SettingsContent() {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [activeTab, setActiveTab] = useState<string>(SETTING_TABS.ACCESSIBILITY);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-72 flex-shrink-0">
                        {/* Mobile Dropdown - Fixed position with high z-index */}
                        <div className="lg:hidden mb-6">
                            <div className="sticky top-8 pt-safe z-[100]">
                                <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={mobileMenuOpen}
                                            className="w-full justify-between bg-background/95 backdrop-blur-sm border shadow-lg"
                                        >
                                            {settingTabs.find((tab) => tab.id === activeTab)?.label}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[var(--radix-popover-trigger-width)] p-0 z-[100]"
                                        align="start"
                                    >
                                        <div className="max-h-[300px] overflow-auto">
                                            {settingTabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                                                        "border-b border-border/50 last:border-b-0",
                                                        activeTab === tab.id && "bg-muted",
                                                    )}
                                                >
                                                    <div className="font-medium text-sm">
                                                        {tab.label}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
                        <TabsList className="hidden lg:grid lg:grid-cols-1 lg:h-auto lg:space-y-1 lg:bg-transparent lg:p-0">
                            {settingTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "w-full justify-start text-left h-auto p-4 rounded-lg min-h-[4rem]",
                                        "data-[state=active]:bg-muted data-[state=active]:shadow-sm",
                                        "data-[state=inactive]:bg-transparent hover:bg-muted/50",
                                    )}
                                >
                                    <div className="flex flex-col items-start w-full">
                                        <div className="font-medium text-base">{tab.label}</div>
                                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {tab.description}
                                        </div>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {settingTabs.map((tab) => (
                            <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-6">
                                <div className="bg-background rounded-lg border p-6 shadow-sm">
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
