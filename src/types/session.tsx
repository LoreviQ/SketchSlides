import { formatDuration, intervalToDuration } from "date-fns";

export enum SessionType {
    Fixed = "Fixed",
    Schedule = "Schedule",
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

export class IntervalGroup {
    interval: number; // in milliseconds
    count: number;

    constructor(interval: number, count: number) {
        this.interval = interval;
        this.count = count;
    }

    static fromObject(obj: any): IntervalGroup {
        return new IntervalGroup(obj.interval, obj.count);
    }

    timeString(): string {
        const minutes = Math.floor(this.interval / 1000 / 60);
        const seconds = (this.interval / 1000) % 60;
        return `${minutes ? `${minutes}m` : ""} ${seconds ? `${seconds}s` : ""}`;
    }
}

export class CustomSchedule {
    title: string;
    intervals: IntervalGroup[];
    isDefault: boolean;

    constructor(title: string, intervals: IntervalGroup[], isDefault = false) {
        this.title = title;
        this.intervals = intervals;
        this.isDefault = isDefault;
    }

    static fromObject(obj: any): CustomSchedule {
        return new CustomSchedule(obj.title, obj.intervals, obj.isDefault);
    }

    get totalTime(): number {
        let totalTime = 0;
        for (const intervalGroup of this.intervals) {
            totalTime += intervalGroup.count * intervalGroup.interval;
        }
        return totalTime;
    }

    get totalTimeString(): string {
        if (this.totalTime === 0) {
            return "0 minutes";
        }
        const duration = intervalToDuration({ start: 0, end: this.totalTime });
        const timeString = formatDuration(duration, { delimiter: ", " });
        return timeString;
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

    equals(other: CustomSchedule): boolean {
        return this.title === other.title && JSON.stringify(this.intervals) === JSON.stringify(other.intervals);
    }
}

export const DEFAULT_SCHEDULE = new CustomSchedule(
    "Default Schedule",
    [
        new IntervalGroup(30000, 12),
        new IntervalGroup(45000, 12),
        new IntervalGroup(60000, 10),
        new IntervalGroup(90000, 10),
        new IntervalGroup(120000, 10),
    ],
    true
);
