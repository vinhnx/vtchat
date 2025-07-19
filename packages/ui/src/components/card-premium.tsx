import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const premiumCardVariants = cva(
    "group rounded-xl border bg-card text-card-foreground transition-all duration-200",
    {
        variants: {
            variant: {
                default:
                    "shadow-md hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50",
                elevated:
                    "hover:-translate-y-1 shadow-slate-200/30 shadow-xl hover:shadow-2xl hover:shadow-slate-200/40 dark:shadow-slate-800/30 dark:hover:shadow-slate-800/40",
                glass: "border-white/20 bg-white/10 shadow-xl backdrop-blur-lg",
                gradient:
                    "border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl dark:border-slate-700/50 dark:from-slate-900 dark:to-slate-800",
                spotlight: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl",
                minimal:
                    "border-slate-200/50 hover:border-slate-300 dark:border-slate-700/50 dark:hover:border-slate-600",
            },
            padding: {
                none: "p-0",
                sm: "p-4",
                default: "p-6",
                lg: "p-8",
                xl: "p-10",
            },
        },
        defaultVariants: {
            variant: "default",
            padding: "default",
        },
    },
);

export interface PremiumCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof premiumCardVariants> {
    spotlight?: boolean;
    glowColor?: string;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
    (
        {
            className,
            variant,
            padding,
            spotlight = false,
            glowColor = "rgba(59, 130, 246, 0.15)",
            children,
            ...props
        },
        ref,
    ) => {
        const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
        const [isHovered, setIsHovered] = React.useState(false);
        const cardRef = React.useRef<HTMLDivElement>(null);

        const handleMouseMove = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!(spotlight && cardRef.current)) return;
                const rect = cardRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            },
            [spotlight],
        );

        const cardClasses = cn(premiumCardVariants({ variant, padding }), className);

        if (spotlight && variant === "spotlight") {
            return (
                <div
                    className={cardClasses}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onMouseMove={handleMouseMove}
                    ref={ref}
                    {...props}
                >
                    <div
                        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
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
            <div className={cardClasses} ref={ref} {...props}>
                {children}
            </div>
        );
    },
);

PremiumCard.displayName = "PremiumCard";

const PremiumCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div className={cn("flex flex-col space-y-2", className)} ref={ref} {...props} />
    ),
);
PremiumCardHeader.displayName = "PremiumCardHeader";

const PremiumCardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            className={cn("text-xl font-semibold leading-tight tracking-tight", className)}
            ref={ref}
            {...props}
        />
    ),
);
PremiumCardTitle.displayName = "PremiumCardTitle";

const PremiumCardDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        className={cn("text-muted-foreground text-sm leading-relaxed", className)}
        ref={ref}
        {...props}
    />
));
PremiumCardDescription.displayName = "PremiumCardDescription";

const PremiumCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div className={cn("pt-4", className)} ref={ref} {...props} />
    ),
);
PremiumCardContent.displayName = "PremiumCardContent";

const PremiumCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div className={cn("flex items-center pt-4", className)} ref={ref} {...props} />
    ),
);
PremiumCardFooter.displayName = "PremiumCardFooter";

export {
    PremiumCard,
    PremiumCardHeader,
    PremiumCardFooter,
    PremiumCardTitle,
    PremiumCardDescription,
    PremiumCardContent,
    premiumCardVariants,
};
