'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Brain, Zap } from 'lucide-react';

interface RouterResult {
    selectedTools: string[];
    scores?: Array<{
        id: string;
        name: string;
        score: number;
        tier: string;
    }>;
    reasoning: string;
    usedQuickMatch: boolean;
    timestamp: number;
}

export function SemanticRouterDebug() {
    const [routerResults, setRouterResults] = useState<RouterResult[]>([]);

    useEffect(() => {
        // Listen for router events (you'll need to emit these from your workflow)
        const handleRouterEvent = (event: CustomEvent) => {
            setRouterResults((prev) => [event.detail, ...prev.slice(0, 4)]); // Keep last 5
        };

        window.addEventListener('semantic-router-result', handleRouterEvent as EventListener);

        return () => {
            window.removeEventListener(
                'semantic-router-result',
                handleRouterEvent as EventListener
            );
        };
    }, []);

    if (process.env.NODE_ENV === 'production') return null;

    return (
        <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto bg-background/95 backdrop-blur z-50">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4" />
                    Semantic Router Debug
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {routerResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No router results yet...</p>
                ) : (
                    routerResults.map((result) => (
                        <div
                            key={result.timestamp}
                            className="p-2 border rounded text-xs space-y-1"
                        >
                            <div className="flex items-center gap-2">
                                <Badge variant={result.usedQuickMatch ? 'default' : 'secondary'}>
                                    {result.usedQuickMatch ? 'Quick' : 'Semantic'}
                                </Badge>
                                {result.selectedTools.length > 0 && (
                                    <Zap className="w-3 h-3 text-green-500" />
                                )}
                            </div>
                            <div>
                                <strong>Tools:</strong> {result.selectedTools.join(', ') || 'None'}
                            </div>
                            <div>
                                <strong>Reasoning:</strong> {result.reasoning}
                            </div>
                            {result.scores && result.scores.length > 0 && (
                                <div>
                                    <strong>Scores:</strong>{' '}
                                    {result.scores
                                        .slice(0, 2)
                                        .map((s) => `${s.name}: ${(s.score * 100).toFixed(1)}%`)
                                        .join(', ')}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
