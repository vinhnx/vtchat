'use client';

import { signIn } from '@/lib/auth-client';
import { Button, Card, CardContent, cn } from '@repo/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

interface LoginFormContentProps extends React.ComponentProps<'div'> {
    redirectUrl?: string;
    onClose?: () => void;
}

function LoginFormContent({
    className,
    redirectUrl: propRedirectUrl,
    onClose,
    ...props
}: LoginFormContentProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const redirectUrl = propRedirectUrl || searchParams.get('redirect_url') || '/chat';

    const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn.email(
                {
                    email,
                    password,
                    callbackURL: redirectUrl,
                },
                {
                    onRequest: () => {
                        setLoading(true);
                    },
                    onSuccess: () => {
                        setLoading(false);
                        onClose?.(); // Close dialog if provided
                    },
                    onError: ctx => {
                        setLoading(false);
                        setError(ctx.error.message || 'Failed to sign in');
                    },
                }
            );
        } catch (err) {
            setLoading(false);
            setError('An unexpected error occurred');
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-6 md:p-8">
                        <form className="flex flex-col gap-6" onSubmit={handleEmailPasswordSignIn}>
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-balance">
                                    Login to your VTChat account
                                </p>
                            </div>
                            {error && (
                                <div className="text-destructive text-center text-sm">{error}</div>
                            )}
                            <Button
                                variant="outlined"
                                className={cn('w-full gap-2')}
                                disabled={loading}
                                onClick={async () => {
                                    await signIn.social(
                                        {
                                            provider: 'google',
                                            callbackURL: redirectUrl,
                                        },
                                        {
                                            onRequest: () => {
                                                setLoading(true);
                                            },
                                            onResponse: () => {
                                                setLoading(false);
                                                onClose?.(); // Close dialog if provided
                                            },
                                        }
                                    );
                                }}
                            >
                                Sign in with Google
                            </Button>
                            <Button
                                variant="outlined"
                                className={cn('w-full gap-2')}
                                disabled={loading}
                                onClick={async () => {
                                    await signIn.social(
                                        {
                                            provider: 'github',
                                            callbackURL: redirectUrl,
                                        },
                                        {
                                            onRequest: () => {
                                                setLoading(true);
                                            },
                                            onResponse: () => {
                                                setLoading(false);
                                                onClose?.(); // Close dialog if provided
                                            },
                                        }
                                    );
                                }}
                            >
                                Sign in with Github
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <Link href="/terms">Terms of Service</Link>{' '}
                and <Link href="/privacy">Privacy Policy</Link>.
            </div>
        </div>
    );
}

export function LoginForm({ className, redirectUrl, onClose, ...props }: LoginFormContentProps) {
    return (
        <Suspense fallback={<p className="text-muted-foreground text-sm">Loading...</p>}>
            <LoginFormContent
                className={className}
                redirectUrl={redirectUrl}
                onClose={onClose}
                {...props}
            />
        </Suspense>
    );
}
