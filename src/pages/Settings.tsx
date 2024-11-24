import { useEffect, useState } from "react";

import type { SelectedFolder } from "../types/preferences";
import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";
import { SessionType, FixedTime, CustomSchedule, IntervalGroup } from "../types/session";
import {
    ToggleButton,
    InputButton,
    ActionButton,
    ScheduleButton,
    IntervalGroupButton,
    NewIntervalButton,
} from "../components/buttons";
import { formatFileSize } from "../utils/formatters";
import { saveLastFolder, getLastFolder } from "../utils/indexDB";
import { sessionTypeToDescription } from "../utils/session";
import { useApp } from "../contexts/AppContext";

export default function Settings({}) {
    const { preferences } = usePreferences();
    const { selectedFolder, setSelectedFolder, setImageFiles, setRunApp } = useApp();
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
        <div className="w-screen flex justify-center px-6">
            <div className="w-full max-w-2xl p-6 space-y-4">
                <h1 className="text-3xl font-bold text-center dark:text-white">DrawIt</h1>
                <ActionButton onClick={handleFolderSelect} label="Select Folder" colour="bg-blue-600" />
                <FolderDetails selectedFolder={selectedFolder} />
                <hr className="border-gray-300 dark:border-gray-700" />
                <SessionToggle />
                <SessionTypeCard />
                <ActionButton onClick={runApp} label="Start" colour="bg-green-600" />
            </div>
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
    return <div className="space-y-4 flex flex-col">{cardContent}</div>;
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
    const { preferences, updatePreferences } = usePreferences();
    const updateSchedules = preferenceUpdater("schedules", updatePreferences);
    const schedules = preferences.schedules.map((schedule) => CustomSchedule.fromObject(schedule));
    const { selectedSchedule, setSelectedSchedule } = useApp();
    useEffect(() => {
        setSelectedSchedule(schedules[0]);
    }, []);
    return (
        <div className="w-full grid grid-cols-2 gap-4">
            <ScheduleSelector
                schedules={schedules}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
                updateSchedules={updateSchedules}
            />
            <ScheduleDetails
                schedules={schedules}
                selectedSchedule={selectedSchedule}
                updateSchedules={updateSchedules}
            />
        </div>
    );
}
interface ScheduleSelectorProps {
    schedules: CustomSchedule[];
    selectedSchedule: CustomSchedule;
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    updateSchedules: (value: CustomSchedule[]) => void;
}
function ScheduleSelector({
    schedules,
    selectedSchedule,
    setSelectedSchedule,
    updateSchedules,
}: ScheduleSelectorProps) {
    const addNewSchedule = () => {
        const newSchedule = new CustomSchedule("Custom Schedule " + schedules.length, [new IntervalGroup(30000, 5)]);
        const updatedSchedules = [...schedules, newSchedule];
        updateSchedules(updatedSchedules);
        setSelectedSchedule(newSchedule);
    };
    const deleteSchedule = (index: number) => {
        const scheduleToDelete = schedules[index];
        const updatedSchedules = schedules.filter((_, i) => i !== index);
        updateSchedules(updatedSchedules);
        // if deleted schedule is selected, select the default schedule
        if (selectedSchedule.equals(scheduleToDelete)) {
            setSelectedSchedule(schedules[0]);
        }
    };
    return (
        <div className="border-r border-gray-300 dark:border-gray-700 pr-4 space-y-4">
            <div className="space-y-2">
                {schedules.map((schedule, index) => (
                    <ScheduleButton
                        key={index}
                        schedule={schedule}
                        isSelected={selectedSchedule.equals(schedule)}
                        setter={() => setSelectedSchedule(schedule)}
                        deleter={() => deleteSchedule(index)}
                    />
                ))}
                <div
                    className="w-full p-3 text-center border rounded-lg bg-zinc-900
                    hover:bg-gray-800 border-gray-700 dark:text-white"
                    onClick={addNewSchedule}
                >
                    + Create New Schedule
                </div>
            </div>
        </div>
    );
}

interface ScheduleDetailsProps {
    schedules: CustomSchedule[];
    selectedSchedule: CustomSchedule;
    updateSchedules: (value: CustomSchedule[]) => void;
}
function ScheduleDetails({ schedules, selectedSchedule, updateSchedules }: ScheduleDetailsProps) {
    const [tempSchedule, setTempSchedule] = useState(selectedSchedule);
    const intervals = tempSchedule.intervals.map((interval) => IntervalGroup.fromObject(interval));

    const saveNewSchedule = () => {
        schedules[schedules.findIndex((s) => s.equals(selectedSchedule))] = tempSchedule;
        updateSchedules(schedules);
    };
    useEffect(() => {
        setTempSchedule(selectedSchedule);
    }, [selectedSchedule]);
    return (
        <div className="pl-4 space-y-4">
            <div className="flex justify-center">
                <input
                    value={tempSchedule.title}
                    onChange={(e) => setTempSchedule(new CustomSchedule(e.target.value, intervals))}
                    disabled={tempSchedule.isDefault}
                    className="text-lg font-medium text-white bg-transparent border-none outline-none focus:outline-none text-center"
                />
            </div>
            <div className="">
                {intervals.map((interval, index) => (
                    <IntervalGroupButton
                        key={index}
                        interval={interval}
                        index={index}
                        tempSchedule={tempSchedule}
                        setTempSchedule={setTempSchedule}
                    />
                ))}
                {!tempSchedule.isDefault && (
                    <NewIntervalButton tempSchedule={tempSchedule} setTempSchedule={setTempSchedule} />
                )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total time: {tempSchedule.totalTimeString}</div>
            {!tempSchedule.isDefault && (
                <ActionButton onClick={saveNewSchedule} label="Save Changes" colour="bg-green-600/50" />
            )}
        </div>
    );
}
