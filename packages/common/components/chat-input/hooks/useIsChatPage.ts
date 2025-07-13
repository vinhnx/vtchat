"use client";

import { usePathname } from "next/navigation";
import { EXCLUDED_PATHS } from "../config/constants";

export const useIsChatPage = () => {
    const pathname = usePathname();
    return !EXCLUDED_PATHS.includes(pathname as any);
};
