'use client';

import { authClient } from '@repo/shared/lib/auth-client';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Separator,
} from '@repo/ui';
import { AlertCircle, CheckCircle, Monitor, Smartphone, Tablet, Trash2, Wifi } from 'lucide-react';

import { useEffect, useState } from 'react';

interface DeviceSession {
    sessionToken: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    userAgent?: string;
    ipAddress?: string;
    isActive?: boolean;
}

interface MultiSessionPanelProps {
    className?: string;
}

const getDeviceIcon = (userAgent: string = '') => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return Smartphone;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
        return Tablet;
    }
    return Monitor;
};

const formatUserAgent = (userAgent: string = '') => {
    if (!userAgent) return 'Unknown Device';

    // Extract browser and OS info
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
    const browser = match ? match[1] : 'Unknown Browser';

    let os = 'Unknown OS';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return `${browser} on ${os}`;
};

export function MultiSessionPanel({ className }: MultiSessionPanelProps) {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<DeviceSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError('');

            // Check if multiSession is available
            if (
                !authClient.multiSession ||
                typeof authClient.multiSession.listDeviceSessions !== 'function'
            ) {
                console.warn('MultiSession plugin not available or not properly configured');
                
                // Fallback: create a current session entry based on the current session data
                if (session) {
                    const currentSession: DeviceSession = {
                        sessionToken: 'current',
                        userId: session.user?.id || '',
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        ipAddress: 'Current Device',
                        isActive: true,
                    };
                    setSessions([currentSession]);
                } else {
                    setSessions([]);
                    setError('No active session found');
                }
                return;
            }

            const response = await authClient.multiSession.listDeviceSessions();

            // Ensure response is an array
            if (Array.isArray(response)) {
                setSessions(response);
            } else {
                console.warn('listDeviceSessions returned non-array:', response);
                // Fallback for current session if multi-session API doesn't work
                if (session) {
                    const currentSession: DeviceSession = {
                        sessionToken: 'current',
                        userId: session.user?.id || '',
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        ipAddress: 'Current Device',
                        isActive: true,
                    };
                    setSessions([currentSession]);
                } else {
                    setSessions([]);
                }
            }
        } catch (err) {
            console.error('Fetch sessions error:', err);
            
            // Fallback: show current session even on error
            if (session) {
                const currentSession: DeviceSession = {
                    sessionToken: 'current',
                    userId: session.user?.id || '',
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    ipAddress: 'Current Device',
                    isActive: true,
                };
                setSessions([currentSession]);
                setError('Unable to fetch all sessions, showing current session only');
            } else {
                setSessions([]);
                setError('Failed to fetch device sessions');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSetActive = async (sessionToken: string) => {
        try {
            setActionLoading(sessionToken);
            setError('');

            if (
                !authClient.multiSession ||
                typeof authClient.multiSession.setActive !== 'function'
            ) {
                setError('Multi-session feature is not available');
                return;
            }

            await authClient.multiSession.setActive({ sessionToken });

            // Refresh sessions to update active status
            await fetchSessions();
        } catch (err) {
            setError('Failed to set active session');
            console.error('Set active session error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevokeSession = async (sessionToken: string) => {
        try {
            setActionLoading(sessionToken);
            setError('');

            if (!authClient.multiSession || typeof authClient.multiSession.revoke !== 'function') {
                setError('Multi-session feature is not available');
                return;
            }

            await authClient.multiSession.revoke({ sessionToken });

            // Refresh sessions after revoking
            await fetchSessions();
        } catch (err) {
            setError('Failed to revoke session');
            console.error('Revoke session error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        Active Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground animate-pulse">
                            Loading sessions...
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Active Sessions
                </CardTitle>
                <CardDescription>
                    Manage your active sessions across different devices and browsers.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Device Sessions</h3>
                        <Badge variant="secondary" className="text-xs">
                            {Array.isArray(sessions) ? sessions.length : 0} active
                        </Badge>
                    </div>

                    {!Array.isArray(sessions) || sessions.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center py-8 text-center">
                            <Wifi className="mb-2 h-8 w-8 opacity-50" />
                            <p className="text-sm">No active sessions found</p>
                            <p className="text-xs">Your sessions will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map(session => {
                                const DeviceIcon = getDeviceIcon(session.userAgent);
                                const isCurrentSession = session.isActive;
                                const isExpired = new Date(session.expiresAt) < new Date();

                                return (
                                    <div
                                        key={session.sessionToken}
                                        className={`flex items-center justify-between rounded-lg border p-3 ${
                                            isCurrentSession
                                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                                <DeviceIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">
                                                        {formatUserAgent(session.userAgent)}
                                                    </p>
                                                    {isCurrentSession && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Current
                                                        </Badge>
                                                    )}
                                                    {isExpired && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            Expired
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-muted-foreground text-xs">
                                                        Created:{' '}
                                                        {new Date(
                                                            session.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    {isCurrentSession && (
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground text-xs">
                                                    Expires:{' '}
                                                    {new Date(session.expiresAt).toLocaleString()}
                                                </p>
                                                {session.ipAddress && (
                                                    <p className="text-muted-foreground text-xs">
                                                        IP: {session.ipAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isCurrentSession && !isExpired && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        actionLoading === session.sessionToken
                                                    }
                                                    onClick={() =>
                                                        handleSetActive(session.sessionToken)
                                                    }
                                                >
                                                    {actionLoading === session.sessionToken ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        'Set Active'
                                                    )}
                                                </Button>
                                            )}
                                            {!isCurrentSession && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        actionLoading === session.sessionToken
                                                    }
                                                    onClick={() =>
                                                        handleRevokeSession(session.sessionToken)
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    {actionLoading === session.sessionToken ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Session Management Info */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        <strong>Multi-Session Control:</strong> You can maintain up to 5 active
                        sessions across different devices. Sessions automatically expire after 7
                        days of inactivity. Only non-current sessions can be revoked.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
