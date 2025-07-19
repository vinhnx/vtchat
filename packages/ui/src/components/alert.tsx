import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const alertVariants = cva(
    'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
    {
        variants: {
            variant: {
                default: 'border-border bg-background text-foreground',
                destructive:
                    'border-red-200 bg-red-50/50 text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-300 [&>svg]:text-red-600 dark:[&>svg]:text-red-400',
                warning:
                    'border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
                info: 'border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/20 dark:text-blue-300 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
                success:
                    'border-green-200 bg-green-50/50 text-green-700 dark:border-green-800/50 dark:bg-green-950/20 dark:text-green-300 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
    <div className={cn(alertVariants({ variant }), className)} ref={ref} role="alert" {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5
            className={cn('mb-1 font-medium leading-none tracking-tight', className)}
            ref={ref}
            {...props}
        />
    )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)} ref={ref} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
