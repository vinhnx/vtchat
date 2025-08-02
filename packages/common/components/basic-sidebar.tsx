"use client";

import { LazySidebar } from "./lazy-sidebar";

interface BasicSidebarProps {
    forceMobile?: boolean;
}

export const BasicSidebar: React.FC<BasicSidebarProps> = ({ forceMobile = false }) => {
    return (
        <div className="w-auto max-w-[300px]">
            <LazySidebar forceMobile={forceMobile} />
        </div>
    );
};
