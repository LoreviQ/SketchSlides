import { usePreferences } from "../contexts/PreferencesContext";
import { FixedTime, SessionType } from "../types/session";

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

export function sessionTypeToDescription(sessionType: SessionType): string {
    switch (sessionType) {
        case SessionType.Fixed:
            return "Practice mode has a fixed interval timer.\nYou can pause whenever you like.";
        case SessionType.Schedule:
            return "Class mode is a 1 hour session.\nStarts with small intervals and ramps up over time.";
        case SessionType.Relaxed:
            return "Relaxed mode has no timer.\nYou decide when to advance to the next image.";
    }
}
