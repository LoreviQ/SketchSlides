import type { UserPreferences } from "../types/preferences";
import { DEFAULT_PREFERENCES } from "../types/preferences";

export const PREFERENCES_KEY = "sketchslides-preferences";

export function savePreferences(preferences: UserPreferences): void {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function loadPreferences(): UserPreferences {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (!saved) return DEFAULT_PREFERENCES;

    try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle missing properties
        return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}
