import { useEffect, useState } from "react";

import type { SelectedFolder } from "../types/preferences";
import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";
import { SessionType, FixedTime, DEFAULT_SCHEDULE, CustomSchedule } from "../types/session";
import { ToggleButton, InputButton, ActionButton } from "../components/buttons";
import { formatFileSize } from "../utils/formatters";
import { saveLastFolder, getLastFolder } from "../utils/indexDB";
import { sessionTypeToDescription } from "../utils/session";

interface SettingsProps {
    selectedFolder: null | SelectedFolder;
    setSelectedFolder: React.Dispatch<React.SetStateAction<null | SelectedFolder>>;
    setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Settings({ selectedFolder, setSelectedFolder, setImageFiles, setRunApp }: SettingsProps) {
    const { preferences } = usePreferences();

    const runApp = () => {
        if (!selectedFolder) {
            alert("Please select a folder first");
            return;
        }
        if (preferences.fixedTime === FixedTime.Other && preferences.customFixedTime === null) {
            alert("Please enter a custom fixed time");
            return;
        }
        setRunApp(true);
    };

    const updateFolderData = async (dirHandle: FileSystemDirectoryHandle) => {
        const files = await FileScanner(dirHandle);
        if (files.length === 0) {
            alert("No image files found in the selected folder");
            return;
        }
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        setSelectedFolder({
            name: dirHandle.name,
            items: files.length,
            totalSize: totalSize,
            dirHandle: dirHandle,
        });
        setImageFiles(files);
    };

    const handleFolderSelect = async () => {
        // Check if the API is supported
        if (!("showDirectoryPicker" in window)) {
            alert(
                "Folder selection is not yet implemented for your browser/OS. Please use a Chromium-based browser on desktop."
            );
            return;
        }

        try {
            const dirHandle = await window.showDirectoryPicker();
            await updateFolderData(dirHandle);
            await saveLastFolder(dirHandle);
        } catch (err) {
            console.error("Error selecting folder:", err);
            if (err instanceof Error && err.name !== "AbortError") {
                alert("An error occurred while selecting the folder");
            }
        }
    };

    const restoreLastFolder = async () => {
        try {
            // Retrieve handle from IndexedDB
            const handle = await getLastFolder();
            if (!handle) {
                console.log("No saved handle found");
                return;
            }
            await updateFolderData(handle);
        } catch (err) {
            console.log("Could not restore last folder:", err);
        }
    };

    // Try to restore the last folder on component mount
    useEffect(() => {
        restoreLastFolder();
    }, []);

    return (
        <div className="w-full max-w-2xl p-6 space-y-4">
            <h1 className="text-3xl font-bold text-center dark:text-white">DrawIt</h1>
            <ActionButton onClick={handleFolderSelect} label="Select Folder" colour="blue" />
            <FolderDetails selectedFolder={selectedFolder} />
            <hr className="border-gray-300 dark:border-gray-700" />
            <SessionToggle />
            <SessionTypeCard />
            <ActionButton onClick={runApp} label="Start" colour="green" />
        </div>
    );
}

async function FileScanner(dirHandle: FileSystemDirectoryHandle): Promise<File[]> {
    const files: File[] = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            if (file.type.startsWith("image/")) {
                files.push(file);
            }
        }
    }
    return files;
}

function SessionToggle({}) {
    const { preferences, updatePreferences } = usePreferences();
    const updateSessionType = preferenceUpdater("sessionType", updatePreferences);
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Session Type</h2>
            <div className="flex gap-2">
                {Object.values(SessionType).map((type) => (
                    <ToggleButton
                        key={type}
                        label={type}
                        isSelected={preferences.sessionType === type}
                        onClick={() => updateSessionType(type)}
                    />
                ))}
            </div>
        </div>
    );
}

function FolderDetails({ selectedFolder }: { selectedFolder: SelectedFolder | null }) {
    if (!selectedFolder) {
        return <p className="text-gray-500 dark:text-gray-400">No folder selected</p>;
    }
    return (
        <div>
            <p className="dark:text-white font-medium">{selectedFolder.name}</p>
            <p className="dark:text-white text-sm">
                {selectedFolder.items} items • {formatFileSize(selectedFolder.totalSize)}
            </p>
        </div>
    );
}

function SessionTypeCard({}) {
    const { preferences } = usePreferences();
    let cardContent = (
        <p className="text-white whitespace-pre-line text-center">
            {sessionTypeToDescription(preferences.sessionType)}
        </p>
    );
    switch (preferences.sessionType) {
        case SessionType.Fixed:
            cardContent = <FixedCard />;
            break;
        case SessionType.Schedule:
            cardContent = <ScheduleCard />;
            break;
    }
    return (
        <div className="min-w-[524px] min-h-[86px] space-y-4 justify-center items-center flex flex-col">
            {cardContent}
        </div>
    );
}

function FixedCard({}) {
    const { preferences, updatePreferences } = usePreferences();
    const updateFixedTime = preferenceUpdater("fixedTime", updatePreferences);
    const updateCustomFixedTime = preferenceUpdater("customFixedTime", updatePreferences);
    return (
        <>
            <h2 className="text-xl font-semibold dark:text-white">Fixed Time</h2>
            <div className="flex gap-2">
                {Object.values(FixedTime).map((time) => {
                    if (time === FixedTime.Other) {
                        return (
                            <InputButton
                                key={time}
                                value={preferences.customFixedTime ?? ""}
                                onClick={() => updateFixedTime(FixedTime.Other)}
                                onChange={(value) => {
                                    updateFixedTime(FixedTime.Other);
                                    updateCustomFixedTime(typeof value === "number" ? value : null);
                                }}
                                placeholder="Custom (s)"
                                isSelected={preferences.fixedTime === FixedTime.Other}
                            />
                        );
                    }
                    return (
                        <ToggleButton
                            key={time}
                            label={time}
                            isSelected={preferences.fixedTime === time}
                            onClick={() => updateFixedTime(time)}
                        />
                    );
                })}
            </div>
        </>
    );
}

function ScheduleCard({}) {
    const { preferences } = usePreferences();
    const [selectedSchedule, setSelectedSchedule] = useState(preferences.schedules[0]);
    return (
        <div className="w-full grid grid-cols-2 gap-4">
            <ScheduleSelector setSelectedSchedule={setSelectedSchedule} />
            <ScheduleDetails selectedSchedule={selectedSchedule} />
        </div>
    );
}

function ScheduleSelector({
    setSelectedSchedule,
}: {
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
}) {
    const { preferences, updatePreferences } = usePreferences();
    const updateSchedules = preferenceUpdater("schedules", updatePreferences);
    const addNewSchedule = () => {
        const newSchedule = new CustomSchedule([{ interval: 30000, count: 5 }]);
        const updatedSchedules = [...preferences.schedules, newSchedule];
        updateSchedules(updatedSchedules);
    };
    const deleteSchedule = (index: number) => {
        const updatedSchedules = preferences.schedules.filter((_, i) => i !== index);
        updateSchedules(updatedSchedules);
    };
    return (
        <div className="border-r border-gray-300 dark:border-gray-700 pr-4 space-y-4">
            <div className="space-y-2">
                {preferences.schedules.map((schedule, index) => (
                    <div key={index} className="relative">
                        <button
                            className="w-full p-3 text-left border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white"
                            onClick={() => setSelectedSchedule(schedule)}
                        >
                            <div>{index === 0 ? "Default Schedule" : `Custom Schedule ${index}`}</div>
                            <div className="text-sm text-gray-500">
                                {schedule.intervals.length} intervals •{Math.round(schedule.totalTime / 1000 / 60)}{" "}
                                minutes total
                            </div>
                        </button>
                        {index !== 0 && ( // Don't allow deleting the default schedule
                            <button
                                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500"
                                onClick={() => deleteSchedule(index)}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button
                    className="w-full p-3 text-center border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white"
                    onClick={addNewSchedule}
                >
                    + Create New Schedule
                </button>
            </div>
        </div>
    );
}

function ScheduleDetails({ selectedSchedule }: { selectedSchedule: CustomSchedule }) {
    return (
        <div className="pl-4 space-y-4">
            <h3 className="text-lg font-medium dark:text-white">Schedule Details</h3>
            <div className="space-y-2">
                {selectedSchedule.intervals.map((interval, index) => (
                    <div key={index} className="p-3 border rounded-lg dark:border-gray-700 dark:text-white">
                        {interval.count}x {interval.interval / 1000}s intervals
                    </div>
                ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Total time: {Math.round(selectedSchedule.totalTime / 1000 / 60)} minutes
            </div>
        </div>
    );
}
