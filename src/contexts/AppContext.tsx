import React, { createContext, useContext, useState } from "react";
import type { SelectedFolder } from "../types/preferences";
import { CustomSchedule, DEFAULT_SCHEDULE } from "../types/session";
import { useFileManager } from "../hooks/fileManager";

interface AppContextType {
    selectedFolder: SelectedFolder | null;
    imageFiles: File[];
    runApp: boolean;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
    selectedSchedule: CustomSchedule;
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    handleFolderSelect: () => Promise<void>;
    handleFileSelect: () => void;
    deleteFile: (index: number) => Promise<boolean>;
    isDragging: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [runApp, setRunApp] = useState(false);
    const { selectedFolder, imageFiles, isDragging, handleFolderSelect, handleFileSelect, deleteFile } =
        useFileManager(runApp);
    const [selectedSchedule, setSelectedSchedule] = useState(DEFAULT_SCHEDULE);

    return (
        <AppContext.Provider
            value={{
                selectedFolder,
                imageFiles,
                runApp,
                setRunApp,
                selectedSchedule,
                setSelectedSchedule,
                handleFolderSelect,
                handleFileSelect,
                deleteFile,
                isDragging,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
