import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const premiumInputVariants = cva(
    'flex w-full rounded-lg border bg-background text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'border-input focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring shadow-sm hover:shadow-md focus-visible:shadow-lg',
                premium: 'border-slate-200 dark:border-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 shadow-md hover:shadow-lg focus-visible:shadow-xl backdrop-blur-sm',
                ghost: 'border-transparent bg-transparent hover:bg-accent/50 focus-visible:bg-background focus-visible:border-input',
                filled: 'border-transparent bg-secondary hover:bg-secondary/80 focus-visible:bg-background focus-visible:border-ring',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                default: 'h-10 px-4',
                lg: 'h-12 px-6 text-base',
            },
            state: {
                default: '',
                error: 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20',
                success: 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20',
                warning: 'border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/20',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            state: 'default',
        },
    }
);

export interface PremiumInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof premiumInputVariants> {
    label?: string;
    helperText?: string;
    errorText?: string;
    successText?: string;
    loading?: boolean;
    showPasswordToggle?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({
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
        iconPosition = 'left',
        ...props
    }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const [focused, setFocused] = React.useState(false);

        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;

        const currentState = React.useMemo(() => {
            if (errorText) return 'error';
            if (successText) return 'success';
            return state;
        }, [errorText, successText, state]);

        const StatusIcon = React.useMemo(() => {
            if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
            if (currentState === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
            if (currentState === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
            return null;
        }, [loading, currentState]);

        return (
            <div className="space-y-2">
                {label && (
                    <label className={cn(
                        'text-sm font-medium transition-colors',
                        focused && 'text-ring',
                        currentState === 'error' && 'text-red-500',
                        currentState === 'success' && 'text-green-500'
                    )}>
                        {label}
                    </label>
                )}
                
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    
                    <input
                        type={inputType}
                        className={cn(
                            premiumInputVariants({ variant, size, state: currentState }),
                            icon && iconPosition === 'left' && 'pl-10',
                            (icon && iconPosition === 'right') || StatusIcon || (isPassword && showPasswordToggle) && 'pr-10',
                            className
                        )}
                        ref={ref}
                        onFocus={(e) => {
                            setFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        {StatusIcon}
                        {icon && iconPosition === 'right' && !StatusIcon && (
                            <div className="text-muted-foreground">{icon}</div>
                        )}
                        {isPassword && showPasswordToggle && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {(helperText || errorText || successText) && (
                    <p className={cn(
                        'text-xs transition-colors',
                        currentState === 'error' && 'text-red-500',
                        currentState === 'success' && 'text-green-500',
                        currentState === 'default' && 'text-muted-foreground'
                    )}>
                        {errorText || successText || helperText}
                    </p>
                )}
            </div>
        );
    }
);

PremiumInput.displayName = 'PremiumInput';

export { PremiumInput, premiumInputVariants };
