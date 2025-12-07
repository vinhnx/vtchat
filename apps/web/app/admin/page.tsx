import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { AdminDashboardClient } from './dashboard-client';

type AdminStats = {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    bannedUsers: number;
    systemHealth: 'good' | 'warning' | 'critical';
    lastMaintenanceRun: string;
    vtPlusUsers: number;
    conversionRate: string;
    totalFeedback: number;
    totalResources: number;
    providerUsage: Array<{
        provider: string;
        requests: number;
        costUsd: string;
    }>;
};

type WebSearchDebug = {
    status: string;
    timestamp: string;
    service: string;
    webSearchConfig: {
        hasGeminiApiKey: boolean;
        geminiKeyLength: number;
        geminiKeyPrefix: string;
        hasJinaApiKey: boolean;
        jinaKeyLength: number;
        environment: string;
        isProduction: boolean;
        isFlyApp: boolean;
        isVercel: boolean;
    };
    budgetStatus: {
        shouldDisable?: boolean;
        error?: string;
    };
    webSearchTest: {
        taskAvailable: boolean;
        status: string;
        error?: string;
    };
    recommendations: Array<{ type: string; message: string; action: string; }>;
};

function normalizeSystemHealth(value: unknown): 'good' | 'warning' | 'critical' {
    if (value === 'good' || value === 'warning' || value === 'critical') return value;
    return 'warning';
}

export default async function AdminDashboard() {
    let stats: AdminStats | null = null;
    let webSearchDebug: WebSearchDebug | null = null;

    try {
        const [analytics, infrastructure, security] = await Promise.allSettled([
            fetchWithAuth('/api/admin/analytics'),
            fetchWithAuth('/api/admin/infrastructure'),
            fetchWithAuth('/api/admin/security'),
        ]);

        const analyticsData = analytics.status === 'fulfilled' ? analytics.value : null;
        const infrastructureData = infrastructure.status === 'fulfilled'
            ? infrastructure.value
            : null;
        const securityData = security.status === 'fulfilled' ? security.value : null;

        if (analyticsData) {
            let systemHealth: 'good' | 'warning' | 'critical' = 'good';
            let lastMaintenanceRun = new Date().toISOString();
            let bannedUsers = 0;

            if (infrastructureData?.infrastructure?.systemHealth) {
                systemHealth = normalizeSystemHealth(
                    infrastructureData.infrastructure.systemHealth,
                );
                lastMaintenanceRun = infrastructureData.infrastructure.lastMaintenanceRun;
            }

            if (securityData?.securityMetrics?.totalBannedUsers !== undefined) {
                bannedUsers = securityData.securityMetrics.totalBannedUsers;
            }

            stats = {
                totalUsers: analyticsData.userMetrics.totalUsers,
                activeUsers: analyticsData.activityMetrics.activeSessionsLast24h,
                newUsersToday: analyticsData.userMetrics.newUsersLast7Days,
                bannedUsers,
                systemHealth,
                lastMaintenanceRun,
                vtPlusUsers: analyticsData.userMetrics.vtPlusUsers,
                conversionRate: analyticsData.userMetrics.conversionRate,
                totalFeedback: analyticsData.activityMetrics.totalFeedback,
                totalResources: analyticsData.activityMetrics.totalResources,
                providerUsage: analyticsData.providerUsage,
            };
        }
    } catch {
        stats = {
            totalUsers: 0,
            activeUsers: 0,
            newUsersToday: 0,
            bannedUsers: 0,
            systemHealth: 'warning',
            lastMaintenanceRun: new Date().toISOString(),
            vtPlusUsers: 0,
            conversionRate: '0.00',
            totalFeedback: 0,
            totalResources: 0,
            providerUsage: [],
        };
    }

    try {
        webSearchDebug = await fetchWithAuth('/api/debug/web-search');
    } catch {
        webSearchDebug = null;
    }

    return <AdminDashboardClient initialStats={stats} webSearchDebug={webSearchDebug} />;
}
