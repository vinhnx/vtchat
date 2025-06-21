'use client';

import type { ReactNode } from 'react';
import { Drawer } from 'vaul';

type VaulDrawerProps = {
    children: ReactNode;
    renderContent: () => ReactNode;
};

export function VaulDrawer({ children, renderContent }: VaulDrawerProps) {
    return (
        <Drawer.Root direction="right">
            <Drawer.Trigger asChild>{children}</Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="bg-secondary/90 fixed inset-0" />
                <Drawer.Content className="bg-secondary fixed bottom-2 right-2  top-2 z-10 flex w-[610px] overflow-hidden rounded-lg outline-none">
                    <div className="border-border bg-secondary flex h-full w-full grow flex-col overflow-y-auto rounded-[16px] border p-6">
                        {renderContent()}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
