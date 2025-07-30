"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Switch } from "@repo/ui";
import { useAccessibility } from "../contexts/accessibility-context";

export function AccessibilitySettings() {
    const { settings, updateSettings, prefersReducedMotion } = useAccessibility();

    const handleReduceMotionChange = (checked: boolean) => {
        updateSettings({ reduceMotion: checked });
    };

    const handleHighContrastChange = (checked: boolean) => {
        updateSettings({ highContrast: checked });
    };

    const handleFontSizeChange = (value: string) => {
        updateSettings({ fontSize: value as "small" | "medium" | "large" | "extra-large" });
    };

    const handleFocusIndicatorsChange = (checked: boolean) => {
        updateSettings({ focusIndicators: checked });
    };

    const handleScreenReaderOptimizationsChange = (checked: boolean) => {
        updateSettings({ screenReaderOptimizations: checked });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                    Configure accessibility settings to improve your experience
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Motion & Animation</CardTitle>
                    <CardDescription>
                        Control how animations and motion effects are displayed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="reduce-motion" className="text-sm font-medium">
                                Reduce Motion
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Disable animations and motion effects throughout the app
                            </p>
                            {prefersReducedMotion && !settings.reduceMotion && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Your system preference is set to reduce motion
                                </p>
                            )}
                        </div>
                        <Switch
                            id="reduce-motion"
                            checked={settings.reduceMotion}
                            onCheckedChange={handleReduceMotionChange}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Visual & Display</CardTitle>
                    <CardDescription>
                        Customize visual appearance and readability settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="high-contrast" className="text-sm font-medium">
                                High Contrast Mode
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Increase contrast for better visibility and readability
                            </p>
                        </div>
                        <Switch
                            id="high-contrast"
                            checked={settings.highContrast}
                            onCheckedChange={handleHighContrastChange}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="focus-indicators" className="text-sm font-medium">
                                Enhanced Focus Indicators
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Show clearer focus outlines for keyboard navigation
                            </p>
                        </div>
                        <Switch
                            id="focus-indicators"
                            checked={settings.focusIndicators}
                            onCheckedChange={handleFocusIndicatorsChange}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Screen Reader Support</CardTitle>
                    <CardDescription>
                        Optimize the interface for screen readers and assistive technology
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="screen-reader-optimizations"
                                className="text-sm font-medium"
                            >
                                Screen Reader Optimizations
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Enable enhanced descriptions and navigation aids for screen readers
                            </p>
                        </div>
                        <Switch
                            id="screen-reader-optimizations"
                            checked={settings.screenReaderOptimizations}
                            onCheckedChange={handleScreenReaderOptimizationsChange}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">System Integration</CardTitle>
                    <CardDescription>
                        How VT Chat respects your system accessibility preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">System Motion Preference</Label>
                        <p className="text-xs text-muted-foreground">
                            VT Chat automatically detects and respects your system's motion
                            preferences.
                            {prefersReducedMotion
                                ? " Your system is currently set to reduce motion."
                                : " Your system allows motion and animations."}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Current Status</Label>
                        <div className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${
                                    prefersReducedMotion ? "bg-orange-500" : "bg-green-500"
                                }`}
                            />
                            <span className="text-xs text-muted-foreground">
                                {prefersReducedMotion
                                    ? "Motion is currently reduced"
                                    : "Motion and animations are enabled"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
