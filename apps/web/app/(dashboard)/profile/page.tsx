'use client';

import { SETTING_TABS, useAppStore } from '@repo/common/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const router = useRouter();
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    useEffect(() => {
        // Open settings modal with Profile tab
        setSettingTab(SETTING_TABS.PROFILE);
        setIsSettingsOpen(true);

        // Redirect to main chat page
        router.replace('/');
    }, [setIsSettingsOpen, setSettingTab, router]);

    // Show minimal loading state while redirecting
    return (
        <div className="flex min-h-dvh items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
        </div>
    );
}
