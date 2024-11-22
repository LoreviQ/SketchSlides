import { createContext, useContext, useState } from "react";
import type { UserPreferences } from "../types/preferences";
import { loadPreferences, savePreferences } from "../utils/preferences";

interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());

    const updatePreferences = (updates: Partial<UserPreferences>) => {
        setPreferences((prev) => {
            const newPreferences = { ...prev, ...updates };
            savePreferences(newPreferences);
            return newPreferences;
        });
    };

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreferences }}>{children}</PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error("usePreferences must be used within a PreferencesProvider");
    }
    return context;
}

export function preferenceUpdater<K extends keyof UserPreferences>(
    key: K,
    updatePreferences: (updates: Partial<UserPreferences>) => void
) {
    // Return a function that updates the preference
    return (value: UserPreferences[K]) => {
        updatePreferences({ [key]: value });
    };
}
