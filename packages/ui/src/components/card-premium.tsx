import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const premiumCardVariants = cva(
    'bg-card text-card-foreground rounded-xl border transition-all duration-200 group',
    {
        variants: {
            variant: {
                default: 'shadow-md hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50',
                elevated: 'shadow-xl shadow-slate-200/30 dark:shadow-slate-800/30 hover:shadow-2xl hover:shadow-slate-200/40 dark:hover:shadow-slate-800/40 hover:-translate-y-1',
                glass: 'bg-white/10 backdrop-blur-lg border-white/20 shadow-xl',
                gradient: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200/50 dark:border-slate-700/50 shadow-xl',
                spotlight: 'relative overflow-hidden hover:shadow-2xl transition-all duration-300',
                minimal: 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600',
            },
            padding: {
                none: 'p-0',
                sm: 'p-4',
                default: 'p-6',
                lg: 'p-8',
                xl: 'p-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'default',
        },
    }
);

export interface PremiumCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof premiumCardVariants> {
    spotlight?: boolean;
    glowColor?: string;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
    ({ className, variant, padding, spotlight = false, glowColor = 'rgba(59, 130, 246, 0.15)', children, ...props }, ref) => {
        const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
        const [isHovered, setIsHovered] = React.useState(false);
        const cardRef = React.useRef<HTMLDivElement>(null);

        const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
            if (!spotlight || !cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }, [spotlight]);

        const cardClasses = cn(premiumCardVariants({ variant, padding }), className);

        if (spotlight && variant === 'spotlight') {
            return (
                <div
                    ref={ref}
                    className={cardClasses}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    {...props}
                >
                    <div
                        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 rounded-xl"
                        style={{
                            opacity: isHovered ? 1 : 0,
                            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
                        }}
                    />
                    <div className="relative z-10">{children}</div>
                </div>
            );
        }

        return (
            <div ref={ref} className={cardClasses} {...props}>
                {children}
            </div>
        );
    }
);

PremiumCard.displayName = 'PremiumCard';

const PremiumCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-2', className)} {...props} />
    )
);
PremiumCardHeader.displayName = 'PremiumCardHeader';

const PremiumCardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('text-xl font-semibold leading-tight tracking-tight', className)}
            {...props}
        />
    )
);
PremiumCardTitle.displayName = 'PremiumCardTitle';

const PremiumCardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-muted-foreground text-sm leading-relaxed', className)} {...props} />
    )
);
PremiumCardDescription.displayName = 'PremiumCardDescription';

const PremiumCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('pt-4', className)} {...props} />
    )
);
PremiumCardContent.displayName = 'PremiumCardContent';

const PremiumCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
    )
);
PremiumCardFooter.displayName = 'PremiumCardFooter';

export {
    PremiumCard,
    PremiumCardHeader,
    PremiumCardFooter,
    PremiumCardTitle,
    PremiumCardDescription,
    PremiumCardContent,
    premiumCardVariants,
};
