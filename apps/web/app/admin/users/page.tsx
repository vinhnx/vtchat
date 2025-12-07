import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { User } from './columns';
import { AdminUsersClient } from './users-client';

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

export default async function AdminUsersPage() {
    let initialUsers: User[] = [];
    let initialStats: UserStats | null = null;
    let totalPages = 0;

    const data = await fetchWithAuth('/api/admin/users?page=1&limit=25');
    if (data) {
        initialUsers = data.users || [];
        initialStats = data.statistics || null;
        totalPages = data.pagination?.totalPages || 0;
    }

    return (
        <AdminUsersClient
            initialUsers={initialUsers}
            initialStats={initialStats}
            initialPagination={{ totalPages, pageSize: 25 }}
        />
    );
}
