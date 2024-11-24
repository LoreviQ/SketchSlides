import React, { createContext, useContext, useState } from "react";
import type { SelectedFolder } from "../types/preferences";
import { CustomSchedule, DEFAULT_SCHEDULE } from "../types/session";

interface AppContextType {
    selectedFolder: SelectedFolder | null;
    setSelectedFolder: React.Dispatch<React.SetStateAction<SelectedFolder | null>>;
    imageFiles: File[];
    setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
    runApp: boolean;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
    selectedSchedule: CustomSchedule;
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [selectedFolder, setSelectedFolder] = useState<null | SelectedFolder>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [runApp, setRunApp] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(CustomSchedule.fromObject(DEFAULT_SCHEDULE));
    return (
        <AppContext.Provider
            value={{
                selectedFolder,
                setSelectedFolder,
                imageFiles,
                setImageFiles,
                runApp,
                setRunApp,
                selectedSchedule,
                setSelectedSchedule,
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
