import { useSignIn, useSignUp } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { log } from '@repo/shared/logger';
import { Button, InputOTP, InputOTPGroup, InputOTPSlot, TypographyH2 } from '@repo/ui';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

type CustomSignInProps = {
    redirectUrl?: string;
    onClose?: () => void;
};

export const CustomSignIn = ({
    redirectUrl = '/sign-in/sso-callback',
    onClose,
}: CustomSignInProps) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [email, _setEmail] = useState('');
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const { signIn, isLoaded, setActive } = useSignIn();
    const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
    const [code, setCode] = useState('');
    const [resending, setResending] = useState(false);
    if (!(isSignUpLoaded && isLoaded)) return null;
    const router = useRouter();

    const handleVerify = async () => {
        // Check if code is complete
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading('verify');
        try {
            if (!(isLoaded && signIn)) return;
            const result = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (result.status === 'complete') {
                setActive({ session: result.createdSessionId });
                router.push('/');
            }
        } catch (error: any) {
            log.error({ errorCount: error.errors?.length }, 'Sign-in validation errors');
            if (error.errors?.some((e: any) => e.code === 'client_state_invalid')) {
                try {
                    const result = await signIn.attemptFirstFactor({
                        strategy: 'email_code',
                        code,
                    });

                    if (result.status === 'complete') {
                        setActive({ session: result.createdSessionId });
                        router.push('/');
                    }
                } catch (error) {
                    if (isClerkAPIResponseError(error)) {
                        log.error({}, 'Clerk API error during sign-in retry');
                    }

                    log.error({ data: error }, 'Sign-in error');
                    setError('Something went wrong while signing in. Please try again.');
                }
            } else {
                log.error({ data: error }, 'Verification error');
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading('google');

        try {
            if (!(isLoaded && signIn)) return;
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl,
                redirectUrlComplete: redirectUrl,
            });
        } catch (error) {
            log.error({ data: error }, 'Google authentication error');
        } finally {
            setIsLoading(null);
        }
    };

    const handleGithubAuth = async () => {
        setIsLoading('github');

        try {
            if (!(isLoaded && signIn)) return;
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_github',
                redirectUrl,
                redirectUrlComplete: redirectUrl,
            });
        } catch (error) {
            log.error({ data: error }, 'GitHub authentication error');
        } finally {
            setIsLoading(null);
        }
    };

    const _handleAppleAuth = async () => {
        setIsLoading('apple');

        try {
            if (!(isLoaded && signIn)) return;
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_apple',
                redirectUrl,
                redirectUrlComplete: redirectUrl,
            });
        } catch (error) {
            log.error('Apple authentication error:', { data: error });
        } finally {
            setIsLoading(null);
        }
    };

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const _handleEmailAuth = async () => {
        setIsLoading('email');
        setError('');

        if (!email) {
            setError('Email is required');
            setIsLoading(null);
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email');
            setIsLoading(null);
            return;
        }

        try {
            // Try signing up the user first
            await signUp.create({ emailAddress: email });

            // If sign-up is successful, send the magic link
            const protocol = window.location.protocol;
            const host = window.location.host;
            const _fullRedirectUrl = `${protocol}//${host}${redirectUrl}`;

            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            });

            setVerifying(true);
        } catch (error: any) {
            if (error.errors?.some((e: any) => e.code === 'form_identifier_exists')) {
                try {
                    // If the user already exists, sign them in instead
                    const signInAttempt = await signIn.create({
                        identifier: email,
                    });

                    log.info('Created sign-in attempt for existing user');

                    // Get the email address ID from the response and prepare the magic link
                    const emailAddressIdObj: any = signInAttempt?.supportedFirstFactors?.find(
                        (factor: any) => factor.strategy === 'email_code'
                    );

                    const emailAddressId: any = emailAddressIdObj?.emailAddressId || '';

                    if (emailAddressId) {
                        await signIn.prepareFirstFactor({
                            strategy: 'email_code',
                            emailAddressId,
                        });

                        setVerifying(true);
                    } else {
                        throw new Error('Email address ID not found');
                    }
                } catch (error: any) {
                    log.error('Sign-in attempt failed');
                    if (error.includes('Incorrect code')) {
                        setError('Incorrect code. Please try again.');
                    } else {
                        log.error('Sign-in error:', { data: error });
                        setError('Something went wrong while signing in. Please try again.');
                    }
                }
            } else {
                log.error('Authentication error:', { data: error });
                setError(
                    error?.errors?.[0]?.longMessage || 'Authentication failed. Please try again.'
                );
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleSendCode = async () => {
        // Don't proceed if already resending
        if (resending) return;

        // Check if email is available
        if (!email) {
            setError('Email is missing. Please try again.');
            return;
        }

        setResending(true);
        setError('');

        try {
            // First try with signUp flow
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            });

            // Show a success message
            setError('');
        } catch (error: any) {
            // If error, try with signIn flow
            if (error.errors?.some((e: any) => e.code === 'client_state_invalid')) {
                try {
                    const signInAttempt = await signIn.create({
                        identifier: email,
                    });

                    const emailAddressIdObj: any = signInAttempt?.supportedFirstFactors?.find(
                        (factor: any) => factor.strategy === 'email_code'
                    );

                    const emailAddressId: any = emailAddressIdObj?.emailAddressId || '';

                    if (emailAddressId) {
                        await signIn.prepareFirstFactor({
                            strategy: 'email_code',
                            emailAddressId,
                        });
                    } else {
                        throw new Error('Email address ID not found');
                    }
                } catch (error) {
                    if (isClerkAPIResponseError(error)) {
                        log.error('Error resending code:', { data: error });
                    }
                    setError('Failed to resend code. Please try again.');
                }
            } else {
                log.error('Error resending code:', { data: error });
                setError('Failed to resend code. Please try again.');
            }
        } finally {
            // Wait a moment before allowing another resend (to prevent spam)
            setTimeout(() => {
                setResending(false);
            }, 3000);
        }
    };

    if (verifying) {
        return (
            <div className="flex w-[300px] flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                    <TypographyH2 className="!text-brand font-clash text-foreground text-center text-[24px] font-semibold leading-tight">
                        Check your email
                    </TypographyH2>
                    <p className="text-muted-foreground text-center text-sm">
                        We've sent a code to your email. Please check your inbox and enter the code
                        to continue.
                    </p>
                </div>
                <InputOTP
                    autoFocus
                    maxLength={6}
                    onChange={setCode}
                    onComplete={handleVerify}
                    value={code}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <p className="text-muted-foreground text-center text-sm">
                    Didn't receive an email?{' '}
                    <span
                        className={`text-brand hover:text-brand cursor-pointer underline ${
                            resending ? 'pointer-events-none opacity-70' : ''
                        }`}
                        onClick={handleSendCode}
                    >
                        {resending ? 'Sending...' : 'Resend Code'}
                    </span>
                </p>

                <div id="clerk-captcha" />
                <div className="text-muted-foreground text-center text-sm">
                    {error && <p className="text-rose-400">{error}</p>}
                    {resending && <p className="text-brand">Sending verification code...</p>}
                </div>
            </div>
        );
    }

    return (
        <>
            <Button
                className="absolute right-2 top-2"
                onClick={() => {
                    onClose?.();
                }}
                size="icon-sm"
                variant="ghost"
            >
                <X className="h-4 w-4" />
            </Button>
            <div className="flex w-[320px] flex-col items-center gap-8">
                <TypographyH2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Welcome to VT!
                </TypographyH2>

                <div className="flex w-[300px] flex-col space-y-1.5">
                    <Button
                        disabled={isLoading === 'google'}
                        onClick={handleGoogleAuth}
                        variant="bordered"
                    >
                        {isLoading === 'google' ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <FaGoogle className=" size-3" />
                        )}
                        {isLoading === 'google' ? 'Authenticating...' : 'Continue with Google'}
                    </Button>

                    <Button
                        disabled={isLoading === 'github'}
                        onClick={handleGithubAuth}
                        variant="bordered"
                    >
                        {isLoading === 'github' ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <FaGithub className=" size-3" />
                        )}
                        {isLoading === 'github' ? 'Authenticating...' : 'Continue with GitHub'}
                    </Button>
                </div>
                <div className="text-muted-foreground/50 w-full text-center text-xs">
                    <span className="text-muted-foreground/50">
                        By using this app, you agree to the{' '}
                    </span>
                    <Link className="hover:text-foreground underline" href="/terms">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link className="hover:text-foreground underline" href="/privacy">
                        Privacy Policy
                    </Link>
                </div>
                <Button className="w-full" onClick={onClose} size="sm" variant="ghost">
                    Close
                </Button>
            </div>
        </>
    );
};
