'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@repo/ui';
import { AlertTriangle } from 'lucide-react';

interface UnlinkAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    providerName: string;
    isLastAccount?: boolean;
    loading?: boolean;
}

export function UnlinkAccountDialog({
    open,
    onOpenChange,
    onConfirm,
    providerName,
    isLastAccount = false,
    loading = false,
}: UnlinkAccountDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Unlink {providerName} Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        {isLastAccount ? (
                            <>
                                <p>
                                    You cannot unlink your only connected account as it would prevent you from
                                    signing in.
                                </p>
                                <p className="text-amber-600">
                                    Please link another account first before unlinking this one.
                                </p>
                            </>
                        ) : (
                            <>
                                <p>
                                    Are you sure you want to unlink your {providerName} account? This will
                                    remove the ability to sign in using {providerName}.
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    You can always link it again later if needed.
                                </p>
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    {!isLastAccount && (
                        <AlertDialogAction
                            onClick={onConfirm}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Unlinking...
                                </>
                            ) : (
                                'Unlink Account'
                            )}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
