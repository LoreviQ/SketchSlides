import { SessionType, FixedTime, CustomSchedule, DEFAULT_SCHEDULE } from "./session";

export type SelectedFolder = {
    name: string;
    items: number;
    totalSize: number;
    dirHandle: FileSystemDirectoryHandle | null;
};

export type UserPreferences = {
    // Session settings
    sessionType: SessionType;
    fixedTime: FixedTime;
    schedules: CustomSchedule[];

    // Practice mode preferences
    mute: boolean;
    grid: boolean;
    flip: boolean;
    greyscale: boolean;
    timer: boolean;
    resizeWindow: boolean;
    customFixedTime: number | null;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
    sessionType: SessionType.Fixed,
    fixedTime: FixedTime.ThirtySeconds,
    schedules: [DEFAULT_SCHEDULE],
    mute: false,
    grid: false,
    flip: false,
    greyscale: false,
    timer: true,
    resizeWindow: true,
    customFixedTime: null,
};
