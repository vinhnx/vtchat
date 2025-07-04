import { Button, type ButtonProps, Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import type { FC, ReactNode } from 'react';

type ConfirmPopoverProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: ButtonProps['variant'];
    cancelVariant?: ButtonProps['variant'];
    children: ReactNode;
    additionalActions?: ReactNode;
};

export const ConfirmPopover: FC<ConfirmPopoverProps> = ({
    open,
    onOpenChange,
    onConfirm,
    title = 'Are you sure?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmVariant = 'destructive',
    cancelVariant = 'ghost',
    children,
    additionalActions,
}) => {
    return (
        <Popover onOpenChange={onOpenChange} open={open}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent>
                <p className="pb-2 text-sm font-medium md:text-base">{title}</p>
                <div className="flex flex-row gap-1">
                    <Button
                        onClick={(e) => {
                            onConfirm();
                            e.stopPropagation();
                        }}
                        variant={confirmVariant}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        onClick={(e) => {
                            onOpenChange(false);
                            e.stopPropagation();
                        }}
                        variant={cancelVariant}
                    >
                        {cancelText}
                    </Button>
                    {additionalActions}
                </div>
            </PopoverContent>
        </Popover>
    );
};
