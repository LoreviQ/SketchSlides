export enum SessionType {
    Fixed = "Fixed",
    Session = "Session",
    Relaxed = "Relaxed",
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

export class CustomSession {
    intervals: IntervalGroup[];

    constructor(intervals: IntervalGroup[]) {
        this.intervals = intervals;
    }

    get totalTime(): number {
        let totalTime = 0;
        for (const intervalGroup of this.intervals) {
            totalTime += intervalGroup.count * intervalGroup.interval;
        }
        return totalTime;
    }

    toIntervals(): number[] {
        const intervals: number[] = [];
        for (const intervalGroup of this.intervals) {
            for (let i = 0; i < intervalGroup.count; i++) {
                intervals.push(intervalGroup.interval);
            }
        }
        return intervals;
    }
}

export const CLASS_SESSION = new CustomSession([
    { interval: 30000, count: 12 },
    { interval: 45000, count: 12 },
    { interval: 60000, count: 10 },
    { interval: 90000, count: 10 },
    { interval: 120000, count: 10 },
]);
