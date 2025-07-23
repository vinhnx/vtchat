"use client";

import { Sidebar } from "./side-bar";

interface BasicSidebarProps {
    forceMobile?: boolean;
}

export const BasicSidebar: React.FC<BasicSidebarProps> = ({ forceMobile = false }) => {
    return (
        <div className="max-w-[300px] w-auto">
            <Sidebar forceMobile={forceMobile} />
        </div>
    );
};
