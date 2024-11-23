import { useEffect } from "react";

import type { SelectedFolder } from "../types/preferences";
import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";
import { SessionType, FixedTime } from "../types/session";
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
            <SessionTypeDetails />
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

function SessionTypeDetails({}) {
    const { preferences } = usePreferences();
    let cardContent = (
        <p className="text-white whitespace-pre-line text-center">
            {sessionTypeToDescription(preferences.sessionType)}
        </p>
    );
    switch (preferences.sessionType) {
        case SessionType.Fixed:
            cardContent = <FixedDetails />;
            break;
    }
    return (
        <div className="min-w-[524px] min-h-[86px] space-y-4 justify-center items-center flex flex-col">
            {cardContent}
        </div>
    );
}

function FixedDetails({}) {
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
