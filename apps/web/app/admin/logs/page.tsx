'use client';

import { ErrorBoundary } from '@repo/common/components';
import { log } from '@repo/shared/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Activity, CheckCircle, Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createColumns, type SessionLog } from './columns';
import { DataTable } from './data-table';

interface LogsStats {
    totalSessions: number;
    activeSessions: number;
    impersonatedSessions: number;
}

interface LogsResponse {
    logs: SessionLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: LogsStats;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const [stats, setStats] = useState<LogsStats | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [impersonationFilter, setImpersonationFilter] = useState('');

    const fetchLogs = useCallback(
        async (
            page = 1,
            search = searchTerm,
            status = statusFilter,
            impersonation = impersonationFilter,
        ) => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: pagination.limit.toString(),
                });

                if (search) params.append('search', search);
                if (status) params.append('status', status);
                if (impersonation) params.append('impersonation', impersonation);

                const response = await fetch(`/api/admin/logs?${params}`);
                if (!response.ok) throw new Error('Failed to fetch logs');

                const data: LogsResponse = await response.json();
                setLogs(data.logs);
                setPagination(data.pagination);
                setStats(data.stats);
            } catch (error) {
                log.error({ error }, 'Failed to fetch logs');
            } finally {
                setLoading(false);
            }
        },
        [pagination.limit, searchTerm, statusFilter, impersonationFilter],
    );

    useEffect(() => {
        fetchLogs(1);
    }, [fetchLogs]);

    const handleSearch = (search: string) => {
        setSearchTerm(search);
        fetchLogs(1, search, statusFilter, impersonationFilter);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        fetchLogs(1, searchTerm, status, impersonationFilter);
    };

    const handleImpersonationFilter = (impersonation: string) => {
        setImpersonationFilter(impersonation);
        fetchLogs(1, searchTerm, statusFilter, impersonation);
    };

    const handlePaginationChange = (page: number) => {
        fetchLogs(page, searchTerm, statusFilter, impersonationFilter);
    };

    const handleSessionAction = async (sessionId: string, action: string) => {
        if (action === 'revoke') {
            try {
                const response = await fetch(`/api/admin/sessions/${sessionId}/revoke`, {
                    method: 'POST',
                });
                if (response.ok) {
                    // Refresh the logs after revoking
                    fetchLogs(pagination.page, searchTerm, statusFilter, impersonationFilter);
                }
            } catch (error) {
                log.error({ error }, 'Failed to revoke session');
            }
        }
    };

    const columns = createColumns({ onSessionAction: handleSessionAction });

    return (
        <div className='space-y-6'>
            {/* Page Header */}
            <div>
                <h1 className='text-2xl font-semibold'>System Logs</h1>
                <p className='text-muted-foreground'>
                    Monitor user sessions, authentication, and system activity
                </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className='grid gap-4 md:grid-cols-3'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Total Sessions</CardTitle>
                            <Activity className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats.totalSessions}</div>
                            <p className='text-muted-foreground text-xs'>All user sessions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Active Sessions</CardTitle>
                            <CheckCircle className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats.activeSessions}</div>
                            <p className='text-muted-foreground text-xs'>Currently active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>Impersonated</CardTitle>
                            <Eye className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats.impersonatedSessions}</div>
                            <p className='text-muted-foreground text-xs'>Admin impersonation</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Session Logs DataTable */}
            <Card>
                <CardContent className='p-6'>
                    <ErrorBoundary>
                        <DataTable
                            columns={columns}
                            data={logs}
                            loading={loading}
                            pagination={pagination}
                            onPaginationChange={handlePaginationChange}
                            onSearch={handleSearch}
                            onStatusFilter={handleStatusFilter}
                            onImpersonationFilter={handleImpersonationFilter}
                        />
                    </ErrorBoundary>
                </CardContent>
            </Card>
        </div>
    );
}
