import { usePreferences } from "../contexts/PreferencesContext";
import { FixedTime } from "../types/session";

export function fixedTimeToMS(fixedTime: FixedTime): number {
    switch (fixedTime) {
        case FixedTime.ThirtySeconds:
            return 30000;
        case FixedTime.FortyFiveSeconds:
            return 45000;
        case FixedTime.OneMinute:
            return 60000;
        case FixedTime.TwoMinutes:
            return 120000;
        case FixedTime.FiveMinutes:
            return 300000;
        case FixedTime.TenMinutes:
            return 600000;
        case FixedTime.Other:
            const { preferences } = usePreferences();
            const seconds = preferences.customFixedTime;
            if (seconds === null) {
                return 30000;
            }
            return seconds * 1000;
    }
}
