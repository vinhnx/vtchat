import { AccountProfilePanel } from '@/components/account-profile-panel';
import { auth } from '@/lib/auth-server';
import { Avatar, Card, CardContent, CardDescription, CardHeader, CardTitle, TypographyH1 } from '@repo/ui';
import { User } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const headersList = await headers();
    const session = await auth.api.getSession({
        headers: headersList,
    });

    if (!session?.user) {
        redirect('/auth/login?redirect_url=/profile');
    }

    const { user } = session;

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <div className="mb-8">
                <TypographyH1 className="mb-2">Profile Settings</TypographyH1>
                <p className="text-muted-foreground">
                    Manage your account information and connected services.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                        <CardDescription>Your basic account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar
                                name={user.name || user.email || 'User'}
                                src={user.image || undefined}
                                size="lg"
                                className="border"
                            />
                            <div>
                                <p className="font-medium">{user.name || 'No name set'}</p>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">User ID:</span>
                                <span className="font-mono text-xs">{user.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email Verified:</span>
                                <span
                                    className={
                                        user.emailVerified ? 'text-green-600' : 'text-amber-600'
                                    }
                                >
                                    {user.emailVerified ? 'Yes' : 'Pending'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member Since:</span>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Linking Panel */}
                <AccountProfilePanel />
            </div>
        </div>
    );
}

// Need to import headers for auth
import { headers } from 'next/headers';
