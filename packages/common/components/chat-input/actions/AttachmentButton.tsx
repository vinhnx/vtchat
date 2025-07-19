'use client';

import { Button } from '@repo/ui';
import { Paperclip } from 'lucide-react';
import { ICON_SIZES } from '../config/constants';

export function AttachmentButton() {
    return (
        <Button
            className="gap-2"
            disabled
            rounded="full"
            size="icon"
            tooltip="Attachment (coming soon)"
            variant="ghost"
        >
            <Paperclip className="text-muted-foreground" size={ICON_SIZES.medium} strokeWidth={2} />
        </Button>
    );
}
