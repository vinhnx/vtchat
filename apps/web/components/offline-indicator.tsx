'use client';

import { Badge } from '@repo/ui';
import { WifiOff } from 'lucide-react';
import { useServiceWorker } from '../lib/hooks/use-service-worker';

export function OfflineIndicator() {
    const { isOnline, isSupported } = useServiceWorker();

    if (!isSupported || isOnline) {
        return null;
    }

    return (
        <div className='fixed bottom-4 left-4 z-50'>
            <Badge variant='destructive' className='flex items-center gap-2 px-3 py-1'>
                <WifiOff className='h-3 w-3' />
                Offline Mode
            </Badge>
        </div>
    );
}
