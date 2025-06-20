import { LoadingSpinner, Type } from '@repo/ui';

export type FullPageLoaderProps = {
  label?: string;
};

export const FullPageLoader = ({ label }: FullPageLoaderProps) => {
  return (
    <div className="z-20 flex min-h-[90vh] w-full flex-1 flex-col items-center justify-center gap-1">
      <LoadingSpinner variant="primary" size="xl" className="text-primary" />
      {label && (
        <Type size="xs" textColor="secondary" className="mt-2">
          {label}
        </Type>
      )}
    </div>
  );
};
