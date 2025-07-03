'use client';

import { Suspense, lazy } from 'react';
import { Dialog, DialogContent } from '@repo/ui';
import { Skeleton } from '@repo/ui';

// Dynamic import the settings modal
const SettingsModal = lazy(() => 
  import('./settings-modal').then(module => ({ default: module.SettingsModal }))
);

// Settings modal loading skeleton
function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export type DynamicSettingsModalProps = React.ComponentProps<typeof SettingsModal>;

export function DynamicSettingsModal(props: DynamicSettingsModalProps) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <Suspense fallback={<SettingsLoadingSkeleton />}>
          <SettingsModal {...props} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
