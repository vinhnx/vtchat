import Link from "next/link";
import { cn } from "../lib/utils";
import { Flex } from "./flex";
import { Type } from "./text";

export type TFormLabel = {
    children?: React.ReactNode;
    className?: string;
    link?: string;
    linkText?: string;
    label: string;
    extra?: () => React.ReactNode;
    isOptional?: boolean;
};
export const FormLabel = ({
    children,
    label,
    extra,
    isOptional,
    className,
    linkText,
    link,
}: TFormLabel) => {
    return (
        <Flex className={cn("w-full", className)} direction="col" gap="none" items="start">
            <Flex className="w-full" gap="sm" items="center">
                <Flex gap="xs" items="center">
                    <Type size="sm" weight="medium">
                        {label}
                    </Type>
                    {isOptional && (
                        <Type size="xs" textColor="secondary">
                            (Optional)
                        </Type>
                    )}
                </Flex>
                {link && (
                    <Link
                        className="decoration-brand/20 py-0.5 text-sm font-medium text-violet-500 underline underline-offset-4 hover:opacity-90"
                        href={link}
                        target="_blank"
                    >
                        {linkText}
                    </Link>
                )}
                {extra?.()}
            </Flex>
            {children && (
                <Type asChild size="xs" textColor="secondary">
                    <div>{children}</div>
                </Type>
            )}
        </Flex>
    );
};
