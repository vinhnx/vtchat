'use client';

import { authClient } from '@repo/shared/lib/auth-client';
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '@repo/ui';
import { AlertCircle, CheckCircle, Github, Link as LinkIcon, Plus, Trash2, Users } from 'lucide-react';

import { useEffect, useState } from 'react';
import { UnlinkAccountDialog } from './unlink-account-dialog';

interface LinkedAccount {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

interface AccountProfilePanelProps {
    className?: string;
}

const providerConfig = {
    google: {
        name: 'Google',
        icon: () => (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
        ),
        color: 'bg-blue-500',
    },
    github: {
        name: 'GitHub',
        icon: Github,
        color: 'bg-gray-800',
    },
} as const;

export function AccountProfilePanel({ className }: AccountProfilePanelProps) {
    const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [unlinkDialog, setUnlinkDialog] = useState<{
        open: boolean;
        providerId: string;
        accountId: string;
        providerName: string;
    }>({
        open: false,
        providerId: '',
        accountId: '',
        providerName: '',
    });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/list-accounts');
            const data = await response.json();

            if (data.success) {
                setAccounts(data.accounts || []);
            } else {
                setError(data.error || 'Failed to fetch accounts');
            }
        } catch (err) {
            setError('Failed to fetch linked accounts');
            console.error('Fetch accounts error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkAccount = async (provider: 'google' | 'github') => {
        try {
            setActionLoading(provider);
            setError('');

            await authClient.linkSocial({
                provider,
                callbackURL: '/profile',
            });

            // Refresh accounts after linking
            await fetchAccounts();
        } catch (err) {
            setError(`Failed to link ${provider} account`);
            console.error('Link account error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnlinkAccount = async (providerId: string, accountId: string) => {
        const config = providerConfig[providerId as keyof typeof providerConfig];
        if (!config) return;

        setUnlinkDialog({
            open: true,
            providerId,
            accountId,
            providerName: config.name,
        });
    };

    const confirmUnlinkAccount = async () => {
        if (!unlinkDialog.providerId || !unlinkDialog.accountId) return;

        try {
            setActionLoading(unlinkDialog.accountId);
            setError('');

            await authClient.unlinkAccount({
                providerId: unlinkDialog.providerId,
                accountId: unlinkDialog.accountId,
            });

            // Refresh accounts after unlinking
            await fetchAccounts();
            
            // Close dialog
            setUnlinkDialog({
                open: false,
                providerId: '',
                accountId: '',
                providerName: '',
            });
        } catch (err) {
            setError(`Failed to unlink ${unlinkDialog.providerName} account`);
            console.error('Unlink account error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const linkedProviders = accounts.map(account => account.providerId);
    const availableProviders = Object.keys(providerConfig).filter(
        provider => !linkedProviders.includes(provider)
    ) as Array<keyof typeof providerConfig>;

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Connected Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading accounts...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Connected Accounts
                </CardTitle>
                <CardDescription>
                    Manage your linked social accounts for easy sign-in and enhanced security.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Linked Accounts */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Linked Accounts</h3>
                        <Badge variant="secondary" className="text-xs">
                            {accounts.length} connected
                        </Badge>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center py-8 text-center">
                            <LinkIcon className="mb-2 h-8 w-8 opacity-50" />
                            <p className="text-sm">No accounts linked yet</p>
                            <p className="text-xs">Link social accounts for easier sign-in</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map(account => {
                                const config = providerConfig[account.providerId as keyof typeof providerConfig];
                                if (!config) return null;

                                const IconComponent = config.icon;
                                const isFirstAccount = accounts.length === 1;

                                return (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${config.color}`}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{config.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-muted-foreground text-xs">
                                                        Connected {new Date(account.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={actionLoading === account.id || isFirstAccount}
                                            onClick={() => handleUnlinkAccount(account.providerId, account.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            {actionLoading === account.id ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Available to Link */}
                {availableProviders.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Available to Link</h3>
                            <div className="space-y-3">
                                {availableProviders.map(providerId => {
                                    const config = providerConfig[providerId];
                                    const IconComponent = config.icon;

                                    return (
                                        <div
                                            key={providerId}
                                            className="flex items-center justify-between rounded-lg border border-dashed p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${config.color} opacity-70`}
                                                >
                                                    <IconComponent className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{config.name}</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        Link your {config.name} account
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={actionLoading === providerId}
                                                onClick={() => handleLinkAccount(providerId)}
                                            >
                                                {actionLoading === providerId ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <>
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        Link
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Security Note */}
                {accounts.length === 1 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            This is your only linked account. For security, it cannot be unlinked unless you add another account first.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Unlink Confirmation Dialog */}
                <UnlinkAccountDialog
                    open={unlinkDialog.open}
                    onOpenChange={(open) =>
                        setUnlinkDialog(prev => ({ ...prev, open }))
                    }
                    onConfirm={confirmUnlinkAccount}
                    providerName={unlinkDialog.providerName}
                    isLastAccount={accounts.length === 1}
                    loading={actionLoading === unlinkDialog.accountId}
                />
            </CardContent>
        </Card>
    );
}
