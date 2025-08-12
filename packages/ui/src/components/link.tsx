import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const linkVariants = cva('inline-flex items-center gap-1 transition-all duration-200', {
    variants: {
        variant: {
            default: 'text-primary hover:text-primary/80 link-hover-effect',
            muted: 'text-muted-foreground hover:text-foreground link-hover-effect',
            underline: 'text-primary underline underline-offset-4 hover:text-primary/80',
            ghost: 'hover:text-foreground',
            button:
                'rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 btn-hover-effect',
        },
        size: {
            default: 'text-sm',
            sm: 'text-xs',
            lg: 'text-base',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

export interface LinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants>
{
    external?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
    ({ className, variant, size, external = false, children, ...props }, ref) => {
        return (
            <a
                ref={ref}
                className={cn(linkVariants({ variant, size, className }))}
                rel={external ? 'noopener noreferrer' : undefined}
                target={external ? '_blank' : undefined}
                {...props}
            >
                {children}
                {external && (
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='size-3'
                    >
                        <path d='M7 7h10v10' />
                        <path d='M7 17 17 7' />
                    </svg>
                )}
            </a>
        );
    },
);
Link.displayName = 'Link';

export { Link, linkVariants };
