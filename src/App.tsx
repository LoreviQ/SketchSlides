import { useState } from "react";
import React, { Suspense } from "react";
import "./App.css";

import type { SelectedFolder } from "./types/preferences";
import { usePreferences } from "./contexts/PreferencesContext";
import { SessionType } from "./types/session";
import Settings from "./pages/Settings";
const Practice = React.lazy(() => import("./pages/Practice"));
const Class = React.lazy(() => import("./pages/Class"));
const Relaxed = React.lazy(() => import("./pages/Relaxed"));
const Custom = React.lazy(() => import("./pages/Custom"));

export default function App() {
    const { preferences } = usePreferences();
    const [selectedFolder, setSelectedFolder] = useState<null | SelectedFolder>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [runApp, setRunApp] = useState(false);

    // if run app, return <Practice /> or <Class /> or <Relaxed /> or <Custom />
    // else return <Settings />
    if (runApp && selectedFolder) {
        switch (preferences.sessionType) {
            case SessionType.Practice:
                return (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Practice
                            selectedFolder={selectedFolder}
                            imageFiles={imageFiles}
                            setImageFiles={setImageFiles}
                            setRunApp={setRunApp}
                        />
                    </Suspense>
                );
            case SessionType.Class:
                return (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Class />
                    </Suspense>
                );
            case SessionType.Relaxed:
                return (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Relaxed />
                    </Suspense>
                );
            case SessionType.Custom:
                return (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Custom />
                    </Suspense>
                );
        }
    }
    return (
        <Settings
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            setImageFiles={setImageFiles}
            setRunApp={setRunApp}
        />
    );
}
