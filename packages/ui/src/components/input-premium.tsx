import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

const premiumInputVariants = cva(
    "flex w-full rounded-lg border bg-background text-sm transition-all duration-200 file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "border-input shadow-sm hover:shadow-md focus-visible:border-ring focus-visible:shadow-lg focus-visible:ring-1 focus-visible:ring-ring",
                premium:
                    "border-slate-200 shadow-md backdrop-blur-sm hover:shadow-lg focus-visible:border-blue-500 focus-visible:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-700",
                ghost: "border-transparent bg-transparent hover:bg-accent/50 focus-visible:border-input focus-visible:bg-background",
                filled: "border-transparent bg-secondary hover:bg-secondary/80 focus-visible:border-ring focus-visible:bg-background",
            },
            size: {
                sm: "h-8 px-3 text-xs",
                default: "h-10 px-4",
                lg: "h-12 px-6 text-base",
            },
            state: {
                default: "",
                error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
                success:
                    "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
                warning:
                    "border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            state: "default",
        },
    },
);

export interface PremiumInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
        VariantProps<typeof premiumInputVariants> {
    label?: string;
    helperText?: string;
    errorText?: string;
    successText?: string;
    loading?: boolean;
    showPasswordToggle?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    (
        {
            className,
            type,
            variant,
            size,
            state,
            label,
            helperText,
            errorText,
            successText,
            loading = false,
            showPasswordToggle = false,
            icon,
            iconPosition = "left",
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const [focused, setFocused] = React.useState(false);

        const isPassword = type === "password";
        const inputType = isPassword && showPassword ? "text" : type;

        const currentState = React.useMemo(() => {
            if (errorText) return "error";
            if (successText) return "success";
            return state;
        }, [errorText, successText, state]);

        const StatusIcon = React.useMemo(() => {
            if (loading) return <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />;
            if (currentState === "error") return <AlertCircle className="h-4 w-4 text-red-500" />;
            if (currentState === "success")
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            return null;
        }, [loading, currentState]);

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        className={cn(
                            "text-sm font-medium transition-colors",
                            focused && "text-ring",
                            currentState === "error" && "text-red-500",
                            currentState === "success" && "text-green-500",
                        )}
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && iconPosition === "left" && (
                        <div className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                            {icon}
                        </div>
                    )}

                    <input
                        className={cn(
                            premiumInputVariants({ variant, size, state: currentState }),
                            icon && iconPosition === "left" && "pl-10",
                            (icon && iconPosition === "right") ||
                                StatusIcon ||
                                (isPassword && showPasswordToggle && "pr-10"),
                            className,
                        )}
                        onBlur={(e) => {
                            setFocused(false);
                            props.onBlur?.(e);
                        }}
                        onFocus={(e) => {
                            setFocused(true);
                            props.onFocus?.(e);
                        }}
                        ref={ref}
                        type={inputType}
                        {...props}
                    />

                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center space-x-1">
                        {StatusIcon}
                        {icon && iconPosition === "right" && !StatusIcon && (
                            <div className="text-muted-foreground">{icon}</div>
                        )}
                        {isPassword && showPasswordToggle && (
                            <button
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                type="button"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {(helperText || errorText || successText) && (
                    <p
                        className={cn(
                            "text-xs transition-colors",
                            currentState === "error" && "text-red-500",
                            currentState === "success" && "text-green-500",
                            currentState === "default" && "text-muted-foreground",
                        )}
                    >
                        {errorText || successText || helperText}
                    </p>
                )}
            </div>
        );
    },
);

PremiumInput.displayName = "PremiumInput";

export { PremiumInput, premiumInputVariants };
