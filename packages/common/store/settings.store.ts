'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface PersonalizationSettings {
    sidebarAutoClose: boolean;
}

type State = {
    personalization: PersonalizationSettings;
};

type Actions = {
    updatePersonalization: (settings: Partial<PersonalizationSettings>) => void;
    getSidebarAutoClose: () => boolean;
    setSidebarAutoClose: (autoClose: boolean) => void;
};

const SETTINGS_KEY = 'vtchat-settings';

// Load settings from localStorage
const loadSettings = (): PersonalizationSettings => {
    if (typeof window === 'undefined') {
        return {
            sidebarAutoClose: true, // Default to auto-close
        };
    }

    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                sidebarAutoClose: parsed.personalization?.sidebarAutoClose ?? true,
            };
        }
    } catch (error) {
        console.warn('Failed to load settings from localStorage:', error);
    }

    return {
        sidebarAutoClose: true, // Default to auto-close
    };
};

// Save settings to localStorage
const saveSettings = (settings: PersonalizationSettings) => {
    if (typeof window === 'undefined') return;

    try {
        const currentSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        const updatedSettings = {
            ...currentSettings,
            personalization: settings,
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
    }
};

export const useSettingsStore = create(
    immer<State & Actions>((set, get) => ({
        personalization: loadSettings(),

        updatePersonalization: (settings: Partial<PersonalizationSettings>) => {
            set(state => {
                state.personalization = { ...state.personalization, ...settings };
            });
            saveSettings(get().personalization);
        },

        getSidebarAutoClose: () => {
            return get().personalization.sidebarAutoClose;
        },

        setSidebarAutoClose: (autoClose: boolean) => {
            get().updatePersonalization({ sidebarAutoClose: autoClose });
        },
    }))
);
