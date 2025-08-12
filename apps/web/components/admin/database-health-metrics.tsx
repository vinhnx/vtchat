'use client';

import { log } from '@repo/shared/lib/logger';
import { Badge, Card, CardContent, CardHeader, CardTitle, LoadingSpinner } from '@repo/ui';
import { Activity, Clock, Database, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DatabaseMetrics {
    health: string;
    connectionTime: number;
    provider: string;
    region: string;
    metrics: {
        cacheHitRatio: number;
        activeConnections: number;
        transactionsCommitted: number;
        transactionsRolledBack: number;
        tuplesReturned: number;
        tuplesFetched: number;
        tuplesInserted: number;
        tuplesUpdated: number;
        tuplesDeleted: number;
    };
    tables: Array<{
        schema: string;
        name: string;
        size: string;
        sizeBytes: number;
    }>;
    indexes: Array<{
        schema: string;
        table: string;
        name: string;
        tuplesRead: number;
        tuplesFetched: number;
    }>;
}

export function DatabaseHealthMetrics() {
    const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/admin/database-metrics');
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data.database);
                } else {
                    setError('Failed to fetch database metrics');
                }
            } catch (err) {
                log.error({ error: err }, 'Failed to fetch database metrics');
                setError('Error fetching database metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
        // Refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <LoadingSpinner />
                <span className='ml-2'>Loading database metrics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className='py-8 text-center'>
                <p className='text-muted-foreground'>{error}</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className='py-8 text-center'>
                <p className='text-muted-foreground'>No database metrics available</p>
            </div>
        );
    }

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent':
                return 'bg-green-500';
            case 'good':
                return 'bg-blue-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'critical':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className='space-y-6'>
            {/* Health Overview */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Database Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={`${getHealthColor(metrics.health)} text-white`}>
                            {metrics.health.toUpperCase()}
                        </Badge>
                        <p className='text-muted-foreground mt-1 text-sm'>
                            {metrics.provider} ({metrics.region})
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Connection Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{metrics.connectionTime}ms</div>
                        <p className='text-muted-foreground text-sm'>Response time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Cache Hit Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {metrics.metrics.cacheHitRatio.toFixed(1)}%
                        </div>
                        <p className='text-muted-foreground text-sm'>Buffer cache efficiency</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Active Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {metrics.metrics.activeConnections}
                        </div>
                        <p className='text-muted-foreground text-sm'>Current connections</p>
                    </CardContent>
                </Card>
            </div>

            {/* Database Activity */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <Activity className='mr-2 h-5 w-5' />
                            Transaction Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <div className='flex justify-between'>
                                <span>Committed</span>
                                <Badge variant='outline'>
                                    {metrics.metrics.transactionsCommitted.toLocaleString()}
                                </Badge>
                            </div>
                            <div className='flex justify-between'>
                                <span>Rolled Back</span>
                                <Badge variant='destructive'>
                                    {metrics.metrics.transactionsRolledBack.toLocaleString()}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <TrendingUp className='mr-2 h-5 w-5' />
                            Data Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <div className='flex justify-between'>
                                <span>Tuples Returned</span>
                                <Badge variant='outline'>
                                    {metrics.metrics.tuplesReturned.toLocaleString()}
                                </Badge>
                            </div>
                            <div className='flex justify-between'>
                                <span>Tuples Inserted</span>
                                <Badge variant='outline'>
                                    {metrics.metrics.tuplesInserted.toLocaleString()}
                                </Badge>
                            </div>
                            <div className='flex justify-between'>
                                <span>Tuples Updated</span>
                                <Badge variant='outline'>
                                    {metrics.metrics.tuplesUpdated.toLocaleString()}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Sizes */}
            {metrics.tables.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <Database className='mr-2 h-5 w-5' />
                            Largest Tables
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {metrics.tables.slice(0, 5).map((table, index) => (
                                <div key={index} className='flex items-center justify-between'>
                                    <span className='font-medium'>{table.name}</span>
                                    <Badge variant='secondary'>{table.size}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Index Usage */}
            {metrics.indexes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <Clock className='mr-2 h-5 w-5' />
                            Top Index Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {metrics.indexes.slice(0, 5).map((index, idx) => (
                                <div key={idx} className='flex items-center justify-between'>
                                    <div>
                                        <span className='font-medium'>{index.name}</span>
                                        <p className='text-muted-foreground text-sm'>
                                            {index.table}
                                        </p>
                                    </div>
                                    <Badge variant='outline'>
                                        {index.tuplesRead.toLocaleString()} reads
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
