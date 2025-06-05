import { CreemCheckoutProcessor } from '@repo/common/components';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Gift,
    MessageSquare,
    Sparkles,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Purchase Successful | VT Chat',
    description: 'Your purchase was successful - Welcome to VT+!',
};

function OrderDetailsCard() {
    return (
        <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600">
                        <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Order Details</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">Transaction Status</p>
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-600">Completed</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">Processing Time</p>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Instant</span>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-3 dark:bg-gray-900">
                    <p className="text-muted-foreground text-sm">
                        Your payment has been processed successfully through Creem.io. Credits have
                        been added to your account and are ready for immediate use.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function SuccessContent() {
    return (
        <div className="container mx-auto px-4 py-16">
            {/* This component processes the checkout params and updates credits */}
            <CreemCheckoutProcessor />

            <div className="mx-auto max-w-4xl">
                {/* Hero Success Section */}
                <div className="mb-12 space-y-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                        <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                            Welcome to VT+! 🎉
                        </h1>
                        <p className="text-muted-foreground text-xl">
                            Your purchase was successful and your credits are ready to use
                        </p>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 text-sm dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
                        <Gift className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                        Credits added instantly to your account
                    </div>
                </div>

                {/* Order Details Card */}
                <OrderDetailsCard />

                {/* Main Content Grid */}
                <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* What's Next Card */}
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-xl">What's Next?</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Your credits are now active and ready to use across all premium
                                features:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Advanced AI models (GPT-4, Claude, etc.)
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Deep research and pro search
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Advanced chat modes
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Dark theme (VT+ subscribers)
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Support Card */}
                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                                    <MessageSquare className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-xl">Need Help?</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Get the most out of your VT+ experience with these resources:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Quick start guide and tutorials
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Priority customer support
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Community forums and tips
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        <Link href="/chat" className="flex items-center">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Start Chatting
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>

                    <Button variant="outlined" asChild size="lg">
                        <Link href="/credits" className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            View Credits Balance
                        </Link>
                    </Button>
                </div>

                {/* Confirmation Details */}
                <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 dark:border-gray-800 dark:from-gray-950/50 dark:to-slate-950/50">
                    <CardContent className="pt-6">
                        <div className="space-y-4 text-center">
                            <div className="flex items-center justify-center">
                                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Transaction Confirmed</h3>
                            </div>

                            <p className="text-muted-foreground mx-auto max-w-2xl text-sm">
                                A confirmation email has been sent to your registered email address.
                                Your credits are now available and ready to use. For any questions
                                or support, please don't hesitate to contact our team.
                            </p>

                            <div className="text-muted-foreground flex flex-wrap justify-center gap-2 text-xs">
                                <span className="rounded-full border bg-white px-3 py-1 dark:bg-gray-900">
                                    ✅ Secure payment processed
                                </span>
                                <span className="rounded-full border bg-white px-3 py-1 dark:bg-gray-900">
                                    ⚡ Credits added instantly
                                </span>
                                <span className="rounded-full border bg-white px-3 py-1 dark:bg-gray-900">
                                    📧 Confirmation email sent
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            <p className="text-muted-foreground">Loading your success page...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
