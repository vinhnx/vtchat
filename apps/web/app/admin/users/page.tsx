'use client';

import { log } from '@repo/shared/lib/logger';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { PaginationState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, CreditCard, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/common/components';
import { createColumns, User } from './columns';
import { DataTable } from './data-table';

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsers30d: number;
    newUsers7d: number;
    vtPlusUsers: number;
    bannedUsers: number;
    verifiedUsers: number;
    conversionRate: string;
    verificationRate: string;
}

interface ApiResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    statistics: UserStats;
    planDistribution: Array<{ plan: string; count: number }>;
    registrationTrend: Array<{ date: string; count: number }>;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // TanStack table pagination state
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });
    const [pageCount, setPageCount] = useState(0);

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

                const response = await fetch(`/api/admin/users?${params}`);
                if (!response.ok) throw new Error('Failed to fetch users');

                const data: ApiResponse = await response.json();
                setUsers(data.users || []);
                setStats(data.statistics || null);
                setPageCount(data.pagination?.totalPages || 0);
            } catch (error) {
                log.error({ error }, 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, planFilter, statusFilter, pagination.pageIndex, pagination.pageSize]
    );

    useEffect(() => {
        // Reset to first page when filters change
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm, planFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUserAction = async (userId: string, action: string, data?: any) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userId, data }),
            });

            if (!response.ok) throw new Error('Failed to update user');

            // Refresh the users list
            fetchUsers();
        } catch (error) {
            log.error({ error }, 'Failed to update user');
        }
    };

    const columns = createColumns({ onUserAction: handleUserAction });

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
    };

    return (
        <div className="container mx-auto space-y-8 py-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
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
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.totalUsers.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    <Badge variant="outline" className="mr-1">
                                        +{stats.newUsers7d || 0}
                                    </Badge>
                                    new this week
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    VT+ Subscribers
                                </CardTitle>
                                <CreditCard className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.vtPlusUsers.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    <Badge variant="default" className="mr-1">
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
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Activity className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.activeUsers.toLocaleString()}
                                </div>
                                <p className="text-muted-foreground text-xs">Last 24 hours</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Email Verified
                                </CardTitle>
                                <CheckCircle className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.verifiedUsers.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    <Badge variant="secondary" className="mr-1">
                                        {typeof stats.verificationRate === 'string'
                                            ? stats.verificationRate
                                            : '0.00'}
                                        %
                                    </Badge>
                                    verified
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </ErrorBoundary>
            )}

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>
                            A comprehensive list of all users with filtering, sorting, and bulk
                            actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={users}
                            searchValue={searchTerm}
                            onSearchChange={setSearchTerm}
                            planFilter={planFilter}
                            onPlanFilterChange={setPlanFilter}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            pagination={pagination}
                            onPaginationChange={handlePaginationChange}
                            pageCount={pageCount}
                            isLoading={loading}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
