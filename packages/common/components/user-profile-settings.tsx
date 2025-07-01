'use client';
import {
    useSession,
    getSessionFresh,
    linkSocial,
    unlinkAccount,
} from '@repo/shared/lib/auth-client';
import { getLinkedAccountsFromDB } from '../utils/account-linking-db';
import { useOptimizedAuth } from '../providers/optimized-auth-provider';
import {
    Alert,
    AlertDescription,
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    FormLabel,
    Input,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { Github, ExternalLink, Unlink, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { MultiSessionPanel } from './multi-session-panel';
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@repo/shared/logger';

export const UserProfileSettings = () => {
    const { data: session } = useSession();
    const { refreshSession } = useOptimizedAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLinking, setIsLinking] = useState<string | null>(null);
    const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
    const [linkedAccounts, setLinkedAccounts] = useState<
        Array<{ providerId: string; accountId: string }>
    >([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [justLinked, setJustLinked] = useState<string | null>(null);
    const [justUnlinked, setJustUnlinked] = useState<string | null>(null);

    // Function to fetch linked accounts from database
    const fetchLinkedAccounts = useCallback(async () => {
        if (!session?.user) {
            setLinkedAccounts([]);
            return;
        }

        setIsLoadingAccounts(true);
        try {
            // Always fetch from database for most accurate information
            const accounts = await getLinkedAccountsFromDB(session.user.id);
            setLinkedAccounts(accounts);
            console.log(
                `[Account Linking] Fetched ${accounts.length} linked accounts from database`
            );
        } catch (err) {
            logger.error('Error fetching linked accounts from database:', { data: err });
            // Fallback to session data if database query fails
            if (session.user.accounts && session.user.accounts.length >= 0) {
                setLinkedAccounts(session.user.accounts);
                logger.info('[Account Linking] Using session data as fallback');
            } else {
                setLinkedAccounts([]);
            }
        } finally {
            setIsLoadingAccounts(false);
        }
    }, [session?.user]);

    // Fetch linked accounts when component mounts or session changes
    useEffect(() => {
        fetchLinkedAccounts();
    }, [fetchLinkedAccounts]);

    // Update form data when session changes
    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                email: session.user.email || '',
            });
        }
    }, [session]);

    // Check for OAuth callback completion and show success feedback
    useEffect(() => {
        const checkOAuthCallback = async () => {
            const linkingProvider = localStorage.getItem('linking_provider');

            if (linkingProvider && session?.user) {
                // Small delay to ensure OAuth callback is processed
                setTimeout(async () => {
                    try {
                        // Refresh session and fetch accounts to get latest data
                        await getSessionFresh();
                        const accounts = await getLinkedAccountsFromDB(session.user.id);

                        // Check if the provider was successfully linked
                        const isNowLinked = accounts.some(
                            acc => acc.providerId === linkingProvider
                        );

                        if (isNowLinked) {
                            // Show success feedback
                            setJustLinked(linkingProvider);
                            setSuccess(
                                `${linkingProvider.charAt(0).toUpperCase() + linkingProvider.slice(1)} account linked successfully`
                            );
                            setTimeout(() => {
                                setSuccess('');
                                setJustLinked(null);
                            }, 3000);

                            // Update the accounts list
                            setLinkedAccounts(accounts);
                            console.log(
                                `[Account Linking] Successfully linked ${linkingProvider} account`
                            );
                        } else {
                            console.log(
                                `[Account Linking] ${linkingProvider} account linking was not completed`
                            );
                        }

                        // Clear the linking state and provider
                        setIsLinking(null);
                        localStorage.removeItem('linking_provider');
                    } catch (err) {
                        logger.error('Error checking OAuth callback result:', { data: err });
                        setIsLinking(null);
                        localStorage.removeItem('linking_provider');
                    }
                }, 1000); // 1 second delay to ensure OAuth processing is complete
            }
        };

        checkOAuthCallback();
    }, [session?.user]);

    const handleSave = async () => {
        if (!session?.user) return;

        setIsUpdating(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/update-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    email: session.user.email || '',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            // Refresh session data
            await getSessionFresh();
            // Trigger global session refresh to update sidebar and other components
            await refreshSession();
            setSuccess('Profile updated successfully');
            setIsEditing(false);

            // Update local form data with new values
            setFormData({
                name: formData.name,
                email: session.user.email || '',
            });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            logger.error('Error updating profile:', { data: err });
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: session?.user?.name || '',
            email: session?.user?.email || '',
        });
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleLinkAccount = async (provider: string) => {
        setIsLinking(provider);
        setError('');

        try {
            // Store the provider we're trying to link in localStorage for callback detection
            localStorage.setItem('linking_provider', provider);

            await linkSocial({
                provider: provider as 'google' | 'github',
                callbackURL: window.location.href, // Stay on the same page
            });

            // Note: Success feedback will be shown after OAuth callback completion
            console.log(`[Account Linking] Initiated ${provider} linking process`);
        } catch (err) {
            console.error(`Error linking ${provider} account:`, err);
            setError(`Failed to link ${provider} account. Please try again.`);
            localStorage.removeItem('linking_provider');
            setIsLinking(null);
        }
        // Don't set isLinking to null here - it will be handled after OAuth callback
    };

    const handleUnlinkAccount = async (provider: string) => {
        setIsUnlinking(provider);
        setError('');

        try {
            await unlinkAccount({
                providerId: provider,
            });

            // Show immediate success feedback
            setJustUnlinked(provider);
            setSuccess(
                `${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully`
            );
            setTimeout(() => {
                setSuccess('');
                setJustUnlinked(null);
            }, 3000);

            // Refresh session and accounts data
            await getSessionFresh();
            await fetchLinkedAccounts();
        } catch (err) {
            console.error(`Error unlinking ${provider} account:`, err);
            setError(`Failed to unlink ${provider} account. Please try again.`);
        } finally {
            setIsUnlinking(null);
        }
    };

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center p-8">
                <TypographyMuted>Please sign in to view your profile.</TypographyMuted>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <TypographyH3>Profile Settings</TypographyH3>
                <TypographyMuted>Manage your account information and preferences</TypographyMuted>
            </div>

            {/* Status Messages */}
            {error && (
                <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                >
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        {success}
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Profile Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal details and account information
                            </CardDescription>
                        </div>
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {!isEditing ? (
                        // View Mode
                        <div className="space-y-4">
                            {/* Profile Avatar Section */}
                            <div className="border-border/50 flex items-center gap-4 border-b pb-4">
                                <Avatar
                                    name={session.user.name || session.user.email || 'User'}
                                    src={session.user.image || undefined}
                                    size="lg"
                                    className="border-border/20 border-2"
                                />
                                <div>
                                    <div className="text-foreground font-semibold">
                                        {session.user.name || 'User'}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        Profile Avatar
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <FormLabel label="Display Name">
                                        <div className="border-border bg-muted/30 text-foreground mt-1 flex min-h-[42px] items-center rounded-lg border px-3 py-2.5 text-sm">
                                            {session.user.name || 'Not set'}
                                        </div>
                                    </FormLabel>
                                </div>

                                <div className="space-y-2">
                                    <FormLabel label="Email Address">
                                        <div className="border-border bg-muted/30 text-foreground mt-1 flex min-h-[42px] items-center rounded-lg border px-3 py-2.5 text-sm">
                                            {session.user.email}
                                        </div>
                                    </FormLabel>
                                </div>
                            </div>

                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="space-y-2">
                                    <div className="text-foreground text-sm font-medium">
                                        Account Status
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            Active
                                        </Badge>
                                        <span className="text-muted-foreground text-xs">
                                            Member since{' '}
                                            {new Date(
                                                session.user.createdAt || Date.now()
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <FormLabel label="Display Name" isOptional>
                                        <Input
                                            value={formData.name}
                                            onChange={e =>
                                                handleInputChange('name', e.target.value)
                                            }
                                            placeholder="Enter your display name"
                                            className="mt-1 h-[42px]"
                                        />
                                    </FormLabel>
                                </div>

                                <div className="space-y-2">
                                    <FormLabel label="Email Address">
                                        <div className="border-border bg-muted/30 text-foreground mt-1 flex min-h-[42px] items-center rounded-lg border px-3 py-2.5 text-sm">
                                            {session.user.email}
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-xs">
                                            Email address cannot be changed
                                        </div>
                                    </FormLabel>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="border-border/50 flex justify-end gap-3 border-t pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    size="sm"
                                    className="min-w-[80px]"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account Security Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Account Security</CardTitle>
                    <CardDescription>
                        Manage your authentication and security settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Authentication Method */}
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-foreground text-sm font-medium">
                                    {session.user.image
                                        ? 'OAuth Authentication'
                                        : 'Password Protection'}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {session.user.image
                                        ? 'Your account is secured via OAuth provider'
                                        : 'Your account is secured with a password'}
                                </div>
                            </div>
                            {!session.user.image && (
                                <Button variant="outline" size="sm">
                                    Change Password
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Additional Security Info */}
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="space-y-2">
                            <div className="text-foreground text-sm font-medium">
                                Account Security
                            </div>
                            <div className="text-muted-foreground text-xs">
                                Your account uses secure authentication methods and encrypted data
                                storage. All sessions are regularly monitored for suspicious
                                activity.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Multi-Session Control Section */}
            <MultiSessionPanel />

            {/* Connected Accounts Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Connected Accounts</CardTitle>
                    <CardDescription>
                        Link your social accounts for easier sign-in and enhanced security
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingAccounts && (
                        <div className="flex items-center justify-center rounded-lg border border-blue-200/50 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-950/10">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                Loading account connections...
                            </div>
                        </div>
                    )}
                    {/* Google Account */}
                    <div
                        className={`rounded-lg border p-4 transition-all duration-200 ${
                            linkedAccounts.some(acc => acc.providerId === 'google')
                                ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                                : 'border-border/50 bg-muted/20'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                                        linkedAccounts.some(acc => acc.providerId === 'google')
                                            ? 'border-green-200 bg-white shadow-md shadow-green-100 dark:border-green-700 dark:shadow-green-900/50'
                                            : 'border-border bg-white'
                                    }`}
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    {/* Connected overlay checkmark */}
                                    {linkedAccounts.some(acc => acc.providerId === 'google') && (
                                        <div className="animate-in fade-in-50 zoom-in-75 absolute -right-1 -top-1 rounded-full bg-green-500 p-0.5 shadow-lg duration-300">
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    {/* Loading overlay */}
                                    {(isLinking === 'google' || isUnlinking === 'google') && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="text-foreground text-sm font-medium">
                                            Google
                                        </div>
                                        {linkedAccounts.some(
                                            acc => acc.providerId === 'google'
                                        ) && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        {justLinked === 'google' ? (
                                            <span className="animate-pulse font-medium text-green-600 dark:text-green-400">
                                                Connection successful!
                                            </span>
                                        ) : justUnlinked === 'google' ? (
                                            <span className="animate-pulse font-medium text-blue-600 dark:text-blue-400">
                                                Account disconnected
                                            </span>
                                        ) : linkedAccounts.some(
                                              acc => acc.providerId === 'google'
                                          ) ? (
                                            'Account successfully connected'
                                        ) : (
                                            'Connect your Google account for easy sign-in'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {linkedAccounts.some(acc => acc.providerId === 'google') ? (
                                    <>
                                        <Badge
                                            variant="secondary"
                                            className={`border-green-200 text-xs transition-all duration-300 dark:border-green-800 ${
                                                justLinked === 'google'
                                                    ? 'animate-pulse bg-green-200 text-green-900 shadow-md dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                            }`}
                                        >
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            {justLinked === 'google'
                                                ? 'Just Connected!'
                                                : 'Connected'}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnlinkAccount('google')}
                                            disabled={isUnlinking === 'google' || isLoadingAccounts}
                                            className="border-red-200 text-red-600 hover:border-red-300 hover:text-red-700 dark:border-red-800 dark:hover:border-red-700"
                                        >
                                            {isUnlinking === 'google' ? (
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Unlink className="mr-1 h-3 w-3" />
                                            )}
                                            {isUnlinking === 'google'
                                                ? 'Disconnecting...'
                                                : 'Disconnect'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLinkAccount('google')}
                                        disabled={isLinking === 'google' || isLoadingAccounts}
                                        className="border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
                                    >
                                        {isLinking === 'google' ? (
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        ) : (
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                        )}
                                        {isLinking === 'google'
                                            ? 'Connecting...'
                                            : 'Connect Account'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* GitHub Account */}
                    <div
                        className={`rounded-lg border p-4 transition-all duration-200 ${
                            linkedAccounts.some(acc => acc.providerId === 'github')
                                ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                                : 'border-border/50 bg-muted/20'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                                        linkedAccounts.some(acc => acc.providerId === 'github')
                                            ? 'border-green-200 bg-white shadow-md shadow-green-100 dark:border-green-700 dark:bg-gray-900 dark:shadow-green-900/50'
                                            : 'border-border bg-white dark:bg-gray-900'
                                    }`}
                                >
                                    <Github className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                                    {/* Connected overlay checkmark */}
                                    {linkedAccounts.some(acc => acc.providerId === 'github') && (
                                        <div className="animate-in fade-in-50 zoom-in-75 absolute -right-1 -top-1 rounded-full bg-green-500 p-0.5 shadow-lg duration-300">
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    {/* Loading overlay */}
                                    {(isLinking === 'github' || isUnlinking === 'github') && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="text-foreground text-sm font-medium">
                                            GitHub
                                        </div>
                                        {linkedAccounts.some(
                                            acc => acc.providerId === 'github'
                                        ) && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        {justLinked === 'github' ? (
                                            <span className="animate-pulse font-medium text-green-600 dark:text-green-400">
                                                Connection successful!
                                            </span>
                                        ) : justUnlinked === 'github' ? (
                                            <span className="animate-pulse font-medium text-blue-600 dark:text-blue-400">
                                                Account disconnected
                                            </span>
                                        ) : linkedAccounts.some(
                                              acc => acc.providerId === 'github'
                                          ) ? (
                                            'Account successfully connected'
                                        ) : (
                                            'Connect your GitHub account for easy sign-in'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {linkedAccounts.some(acc => acc.providerId === 'github') ? (
                                    <>
                                        <Badge
                                            variant="secondary"
                                            className={`border-green-200 text-xs transition-all duration-300 dark:border-green-800 ${
                                                justLinked === 'github'
                                                    ? 'animate-pulse bg-green-200 text-green-900 shadow-md dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                            }`}
                                        >
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            {justLinked === 'github'
                                                ? 'Just Connected!'
                                                : 'Connected'}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnlinkAccount('github')}
                                            disabled={isUnlinking === 'github' || isLoadingAccounts}
                                            className="border-red-200 text-red-600 hover:border-red-300 hover:text-red-700 dark:border-red-800 dark:hover:border-red-700"
                                        >
                                            {isUnlinking === 'github' ? (
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Unlink className="mr-1 h-3 w-3" />
                                            )}
                                            {isUnlinking === 'github'
                                                ? 'Disconnecting...'
                                                : 'Disconnect'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLinkAccount('github')}
                                        disabled={isLinking === 'github' || isLoadingAccounts}
                                        className="border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-950/20 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-950/30"
                                    >
                                        {isLinking === 'github' ? (
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        ) : (
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                        )}
                                        {isLinking === 'github'
                                            ? 'Connecting...'
                                            : 'Connect Account'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="space-y-2">
                            <div className="text-foreground text-sm font-medium">
                                Account Linking Benefits
                            </div>
                            <ul className="text-muted-foreground space-y-1 text-xs">
                                <li>• Faster sign-in with multiple authentication options</li>
                                <li>
                                    • Enhanced account security with multiple verification methods
                                </li>
                                <li>• Easy account recovery if you lose access to one provider</li>
                                <li>• Seamless experience across different platforms</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
