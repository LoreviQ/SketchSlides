export enum SessionType {
    Practice = "Practice",
    Class = "Class",
    Relaxed = "Relaxed",
    Custom = "Custom",
}

export enum FixedTime {
    ThirtySeconds = "30s",
    FortyFiveSeconds = "45s",
    OneMinute = "1m",
    TwoMinutes = "2m",
    FiveMinutes = "5m",
    TenMinutes = "10m",
    Other = "Other",
}

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
            return 30000;
        default:
            return 30000; // Default to 30 seconds if unspecified
    }
}
