import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

// Typography variants based on Shadcn's typography system
const typographyVariants = cva('', {
    variants: {
        variant: {
            h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
            h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
            h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
            h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
            p: 'leading-7 [&:not(:first-child)]:mt-6',
            blockquote: 'mt-6 border-l-2 pl-6 italic',
            list: 'my-6 ml-6 list-disc [&>li]:mt-2',
            inlineCode: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
            lead: 'text-xl text-muted-foreground',
            large: 'text-lg font-semibold',
            small: 'text-sm font-medium leading-none',
            muted: 'text-sm text-muted-foreground',
        },
        affects: {
            removePMargin: '[&_p]:m-0',
            default: '',
        },
    },
    defaultVariants: {
        variant: 'p',
        affects: 'default',
    },
});

export interface TypographyProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof typographyVariants> {
    asChild?: boolean;
    as?: keyof JSX.IntrinsicElements;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, affects, asChild = false, as, children, ...props }, ref) => {
        const elementMap = {
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
            h4: 'h4',
            p: 'p',
            blockquote: 'blockquote',
            list: 'ul',
            inlineCode: 'code',
            lead: 'p',
            large: 'div',
            small: 'small',
            muted: 'p',
        } as const;

        const Element = (as || elementMap[variant || 'p']) as keyof JSX.IntrinsicElements;

        return React.createElement(
            Element,
            {
                className: cn(typographyVariants({ variant, affects, className })),
                ref,
                ...props,
            },
            children
        );
    }
);

Typography.displayName = 'Typography';

// Convenience components for common typography elements
export const TypographyH1 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="h1" className={className} {...props} />
));
TypographyH1.displayName = 'TypographyH1';

export const TypographyH2 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="h2" className={className} {...props} />
));
TypographyH2.displayName = 'TypographyH2';

export const TypographyH3 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="h3" className={className} {...props} />
));
TypographyH3.displayName = 'TypographyH3';

export const TypographyH4 = React.forwardRef<
    HTMLHeadingElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="h4" className={className} {...props} />
));
TypographyH4.displayName = 'TypographyH4';

export const TypographyP = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="p" className={className} {...props} />
));
TypographyP.displayName = 'TypographyP';

export const TypographyBlockquote = React.forwardRef<
    HTMLQuoteElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="blockquote" className={className} {...props} />
));
TypographyBlockquote.displayName = 'TypographyBlockquote';

export const TypographyList = React.forwardRef<
    HTMLUListElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="list" className={className} {...props} />
));
TypographyList.displayName = 'TypographyList';

export const TypographyInlineCode = React.forwardRef<
    HTMLElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="inlineCode" className={className} {...props} />
));
TypographyInlineCode.displayName = 'TypographyInlineCode';

export const TypographyLead = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="lead" className={className} {...props} />
));
TypographyLead.displayName = 'TypographyLead';

export const TypographyLarge = React.forwardRef<
    HTMLDivElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="large" className={className} {...props} />
));
TypographyLarge.displayName = 'TypographyLarge';

export const TypographySmall = React.forwardRef<
    HTMLElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="small" className={className} {...props} />
));
TypographySmall.displayName = 'TypographySmall';

export const TypographyMuted = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, 'variant'>
>(({ className, ...props }, ref) => (
    <Typography ref={ref} variant="muted" className={className} {...props} />
));
TypographyMuted.displayName = 'TypographyMuted';

export { Typography, typographyVariants };
