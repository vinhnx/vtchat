"use client";

import { Sidebar } from "./side-bar";

interface BasicSidebarProps {
    forceMobile?: boolean;
}

export const BasicSidebar: React.FC<BasicSidebarProps> = ({ forceMobile = false }) => {
    return (
        <div className="w-auto max-w-[300px]">
            <Sidebar forceMobile={forceMobile} />
        </div>
    );
};
