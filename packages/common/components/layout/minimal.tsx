'use client';

import { FC } from 'react';

export type TMinimalLayout = {
    children: React.ReactNode;
};

export const MinimalLayout: FC<TMinimalLayout> = ({ children }) => {
    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            <div className="flex w-full flex-col gap-2 overflow-y-auto p-4">{children}</div>
        </div>
    );
};
