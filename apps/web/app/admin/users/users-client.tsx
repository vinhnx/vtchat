'use client';

import { ErrorBoundary } from '@repo/common/components';
import { http } from '@repo/shared/lib/http-client';
import { log } from '@repo/shared/lib/logger';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import type { PaginationState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, CreditCard, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createColumns, type User } from './columns';
import { DataTable } from './data-table';

type UserStats = {
    totalUsers: number;
    activeUsers: number;
    newUsers30d: number;
    newUsers7d: number;
    vtPlusUsers: number;
    bannedUsers: number;
    verifiedUsers: number;
    conversionRate: string;
    verificationRate: string;
};

type ApiResponse = {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    statistics: UserStats;
    planDistribution: Array<{ plan: string; count: number; }>;
    registrationTrend: Array<{ date: string; count: number; }>;
};

type Props = {
    initialUsers: User[];
    initialStats: UserStats | null;
    initialPagination: { totalPages: number; pageSize: number; };
};

export function AdminUsersClient({
    initialUsers,
    initialStats,
    initialPagination,
}: Props) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [stats, setStats] = useState<UserStats | null>(initialStats);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pageCount, setPageCount] = useState(initialPagination.totalPages);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPagination.pageSize,
    });

    const hasHydrated = useRef(false);

    const fetchUsers = useCallback(
        async (page = pagination.pageIndex + 1, pageSize = pagination.pageSize) => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: pageSize.toString(),
                });

                if (searchTerm) params.append('search', searchTerm);
                if (planFilter && planFilter !== 'all') params.append('plan', planFilter);
                if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

                const data: ApiResponse = await http.get(`/api/admin/users?${params}`);
                setUsers(data.users || []);
                setStats(data.statistics || null);
                setPageCount(data.pagination?.totalPages || 0);
            } catch (error) {
                log.error({ error }, 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, planFilter, statusFilter, pagination.pageIndex, pagination.pageSize],
    );

    useEffect(() => {
        if (hasHydrated.current) {
            fetchUsers();
            return;
        }
        hasHydrated.current = true;
    }, [fetchUsers]);

    const handleUserAction = async (userId: string, action: string, data?: any) => {
        try {
            await http.post('/api/admin/users', {
                body: { action, userId, data },
            });

            fetchUsers();
        } catch (error) {
            log.error({ error }, 'Failed to update user');
        }
    };

    const columns = createColumns({ onUserAction: handleUserAction });

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
    };

    // Reset to first page when filters change
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm, planFilter, statusFilter]);

    const isEmptyInitial = !initialUsers.length && !initialStats;

    return (
        <div className='container mx-auto space-y-8 py-8'>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-2'
            >
                <h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
                <p className='text-muted-foreground'>
                    Manage user accounts, roles, and subscriptions with advanced filtering and
                    sorting
                </p>
            </motion.div>

            {/* Statistics Cards */}
            {stats && (
                <ErrorBoundary>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'
                    >
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
                                <Users className='text-muted-foreground h-4 w-4' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>
                                    {stats.totalUsers.toLocaleString()}
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                    <Badge variant='outline' className='mr-1'>
                                        +{stats.newUsers7d || 0}
                                    </Badge>
                                    new this week
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    VT+ Subscribers
                                </CardTitle>
                                <CreditCard className='text-muted-foreground h-4 w-4' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>
                                    {stats.vtPlusUsers.toLocaleString()}
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                    <Badge variant='default' className='mr-1'>
                                        {typeof stats.conversionRate === 'string'
                                            ? stats.conversionRate
                                            : '0.00'}
                                        %
                                    </Badge>
                                    conversion rate
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
                                <Activity className='text-muted-foreground h-4 w-4' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>
                                    {stats.activeUsers.toLocaleString()}
                                </div>
                                <p className='text-muted-foreground text-xs'>Last 24 hours</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    Email Verified
                                </CardTitle>
                                <CheckCircle className='text-muted-foreground h-4 w-4' />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>
                                    {stats.verifiedUsers.toLocaleString()}
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                    <Badge variant='secondary' className='mr-1'>
                                        {typeof stats.verificationRate === 'string'
                                            ? stats.verificationRate
                                            : '0.00'}
                                        %
                                    </Badge>
                                    verification rate
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </ErrorBoundary>
            )}

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        Manage user accounts and their subscription status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEmptyInitial && !loading
                        ? (
                            <div className='text-muted-foreground text-sm'>
                                Unable to load users right now. Please retry filters or refresh
                                later.
                            </div>
                        )
                        : (
                            <DataTable
                                columns={columns}
                                data={users}
                                loading={loading}
                                onPaginationChange={handlePaginationChange}
                                onPlanFilterChange={setPlanFilter}
                                onSearchChange={setSearchTerm}
                                onStatusFilterChange={setStatusFilter}
                                pageCount={pageCount}
                                pagination={pagination}
                            />
                        )}
                </CardContent>
            </Card>
        </div>
    );
}
