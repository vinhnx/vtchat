'use client';

import { Card, CardContent, CardHeader } from '@repo/ui';
import { Settings2, Sparkles, Zap, Globe, Moon, HeadphonesIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { PRICING_CONFIG } from '../lib/config/pricing'; // Corrected import path

interface FeatureItem {
    name: string;
    description: string;
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
            aria-hidden
            className="bg-radial to-background absolute inset-0 from-transparent to-75%"
        />
        <div className="dark:bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t bg-white">{children}</div>
    </div>
);

const getFeatureIcon = (featureName: string) => {
    const name = featureName.toLowerCase();
    if (name.includes('search') || name.includes('grounding') || name.includes('web')) {
        return <Globe className="size-6" aria-hidden />;
    }
    if (name.includes('dark') || name.includes('mode')) {
        return <Moon className="size-6" aria-hidden />;
    }
    if (name.includes('support') || name.includes('priority')) {
        return <HeadphonesIcon className="size-6" aria-hidden />;
    }
    if (name.includes('ai') || name.includes('advanced') || name.includes('features')) {
        return <Sparkles className="size-6" aria-hidden />;
    }
    if (name.includes('unlimited') || name.includes('usage')) {
        return <Zap className="size-6" aria-hidden />;
    }
    // Default icon
    return <Settings2 className="size-6" aria-hidden />;
};

export function FeaturesAccordion() {
    const plusFeatures: ReadonlyArray<FeatureItem> = PRICING_CONFIG.pricing.plus.features;

    return (
        <section className="py-8">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:grid-cols-2 lg:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]">
                    {plusFeatures.map((feature: FeatureItem, index: number) => (
                        <Card key={index} className="group border-0 shadow-none">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    {getFeatureIcon(feature.name)}
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">{feature.name}</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
