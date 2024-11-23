import { SessionType, FixedTime } from "./session";

export type SelectedFolder = {
    name: string;
    items: number;
    totalSize: number;
    dirHandle: FileSystemDirectoryHandle;
};

export type UserPreferences = {
    // Session settings
    sessionType: SessionType;
    fixedTime: FixedTime;

    // Practice mode preferences
    mute: boolean;
    grid: boolean;
    flip: boolean;
    greyscale: boolean;
    timer: boolean;
    customFixedTime: number | null;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
    sessionType: SessionType.Fixed,
    fixedTime: FixedTime.ThirtySeconds,
    mute: false,
    grid: false,
    flip: false,
    greyscale: false,
    timer: false,
    customFixedTime: null,
};
