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

export type IntervalGroup = {
    interval: number; // in milliseconds
    count: number;
};

export type CustomSession = {
    intervals: IntervalGroup[];
};

export const CLASS_SESSION: CustomSession = {
    intervals: [
        { interval: 30000, count: 12 },
        { interval: 45000, count: 12 },
        { interval: 60000, count: 10 },
        { interval: 90000, count: 10 },
        { interval: 120000, count: 10 },
    ],
};
