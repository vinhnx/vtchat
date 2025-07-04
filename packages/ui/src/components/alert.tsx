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
                    'border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/20 [&>svg]:text-destructive',
                warning:
                    'border-amber-500/50 bg-amber-50 text-amber-800 dark:border-amber-400 dark:bg-amber-950/20 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
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

export { Alert, AlertTitle, AlertDescription };
