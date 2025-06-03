import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { CheckCircleIcon } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Purchase Successful | VT Chat',
    description: 'Your purchase was successful',
};

function SuccessContent() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-2xl text-center">
                <Card>
                    <CardHeader>
                        <div className="mb-4 flex justify-center">
                            <CheckCircleIcon className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">
                            Purchase Successful!
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground text-lg">
                            Thank you for your purchase. Your credits have been added to your
                            account and you can start using them immediately.
                        </p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <h3 className="mb-2 font-medium">What's Next?</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Start chatting with advanced AI models using your new
                                        credits.
                                    </p>
                                </div>

                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <h3 className="mb-2 font-medium">Need Help?</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Check out our guides on getting the most from your credits.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Button asChild>
                                    <Link href="/chat">Start Chatting</Link>
                                </Button>

                                <Button variant="outlined" asChild>
                                    <Link href="/credits">View Credits</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="text-muted-foreground text-sm">
                            <p>
                                A confirmation email has been sent to your registered email address.
                                If you have any questions, please contact our support team.
                            </p>
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
                        <p>Loading...</p>
                    </div>
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
