import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "react";
import * as React from "react";
import { cn } from "../lib/utils";

// Typography variants based on Shadcn's typography system
const typographyVariants = cva("", {
    variants: {
        variant: {
            h1: "scroll-m-20 text-balance font-extrabold text-4xl tracking-tight",
            h2: "mt-10 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0",
            h3: "mt-8 scroll-m-20 font-semibold text-2xl tracking-tight",
            h4: "scroll-m-20 font-semibold text-xl tracking-tight",
            p: "leading-7 [&:not(:first-child)]:mt-6",
            blockquote: "mt-6 border-l-2 pl-6 italic",
            list: "my-6 ml-6 list-disc [&>li]:mt-2",
            inlineCode:
                "relative rounded-sm bg-muted px-[0.3rem] py-[0.2rem] font-sans font-semibold text-sm",
            lead: "text-muted-foreground text-xl leading-7 [&:not(:first-child)]:mt-6",
            large: "font-semibold text-lg",
            small: "font-medium text-sm leading-none",
            muted: "text-muted-foreground text-sm",
            table: "my-6 w-full overflow-y-auto",
        },
        affects: {
            removePMargin: "[&_p]:m-0",
            default: "",
        },
    },
    defaultVariants: {
        variant: "p",
        affects: "default",
    },
});

export interface TypographyProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof typographyVariants> {
    asChild?: boolean;
    as?: keyof JSX.IntrinsicElements;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, affects, asChild: _asChild = false, as, children, ...props }, ref) => {
        const elementMap = {
            h1: "h1",
            h2: "h2",
            h3: "h3",
            h4: "h4",
            p: "p",
            blockquote: "blockquote",
            list: "ul",
            inlineCode: "code",
            lead: "p",
            large: "div",
            small: "small",
            muted: "p",
            table: "div",
        } as const;

        const Element = (as || elementMap[variant || "p"]) as keyof JSX.IntrinsicElements;

        return React.createElement(
            Element,
            {
                className: cn(typographyVariants({ variant, affects, className })),
                ref,
                ...props,
            },
            children,
        );
    },
);

Typography.displayName = "Typography";

// Convenience components for common typography elements
export const TypographyH1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="h1" {...props} />
    ),
);
TypographyH1.displayName = "TypographyH1";

export const TypographyH2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="h2" {...props} />
    ),
);
TypographyH2.displayName = "TypographyH2";

export const TypographyH3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="h3" {...props} />
    ),
);
TypographyH3.displayName = "TypographyH3";

export const TypographyH4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="h4" {...props} />
    ),
);
TypographyH4.displayName = "TypographyH4";

export const TypographyP = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="p" {...props} />
    ),
);
TypographyP.displayName = "TypographyP";

export const TypographyBlockquote = React.forwardRef<
    HTMLQuoteElement,
    Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
    <Typography className={className} ref={ref} variant="blockquote" {...props} />
));
TypographyBlockquote.displayName = "TypographyBlockquote";

export const TypographyList = React.forwardRef<HTMLUListElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="list" {...props} />
    ),
);
TypographyList.displayName = "TypographyList";

export const TypographyInlineCode = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="inlineCode" {...props} />
    ),
);
TypographyInlineCode.displayName = "TypographyInlineCode";

export const TypographyLead = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
    <Typography className={className} ref={ref} variant="lead" {...props} />
));
TypographyLead.displayName = "TypographyLead";

export const TypographyLarge = React.forwardRef<HTMLDivElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="large" {...props} />
    ),
);
TypographyLarge.displayName = "TypographyLarge";

export const TypographySmall = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography className={className} ref={ref} variant="small" {...props} />
    ),
);
TypographySmall.displayName = "TypographySmall";

export const TypographyMuted = React.forwardRef<
    HTMLParagraphElement,
    Omit<TypographyProps, "variant">
>(({ className, ...props }, ref) => (
    <Typography className={className} ref={ref} variant="muted" {...props} />
));
TypographyMuted.displayName = "TypographyMuted";

// Table component for better typography
export const TypographyTable = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        children: React.ReactNode;
    }
>(({ children, ...props }, ref) => (
    <div className="my-6 w-full overflow-y-auto" ref={ref} {...props}>
        <table className="w-full">{children}</table>
    </div>
));
TypographyTable.displayName = "TypographyTable";

// Table Header component
export const TypographyTableHeader = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        className={cn(
            "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
            className,
        )}
        ref={ref}
        {...props}
    />
));
TypographyTableHeader.displayName = "TypographyTableHeader";

// Table Cell component
export const TypographyTableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        className={cn(
            "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
            className,
        )}
        ref={ref}
        {...props}
    />
));
TypographyTableCell.displayName = "TypographyTableCell";

// Table Row component
export const TypographyTableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr className={cn("even:bg-muted m-0 border-t p-0", className)} ref={ref} {...props} />
));
TypographyTableRow.displayName = "TypographyTableRow";

export { Typography, typographyVariants };
