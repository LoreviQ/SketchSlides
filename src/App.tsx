import { useState } from "react";
import React, { Suspense } from "react";
import "./App.css";

import { SessionType, FixedTime } from "./types/session";
const Practice = React.lazy(() => import("./pages/Practice"));
const Class = React.lazy(() => import("./pages/Class"));
const Relaxed = React.lazy(() => import("./pages/Relaxed"));
const Custom = React.lazy(() => import("./pages/Custom"));
import Settings from "./pages/Settings";

export default function App() {
    const [sessionType, setSessionType] = useState<SessionType>(SessionType.Practice);
    const [fixedTime, setFixedTime] = useState<FixedTime>(FixedTime.ThirtySeconds);
    const [selectedFolder, setSelectedFolder] = useState<null | { name: string; items: number; totalSize: number }>(
        null
    );
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [runApp, setRunApp] = useState(false);

    // if run app, return <Practice /> or <Class /> or <Relaxed /> or <Custom />
    // else return <Settings />
    if (runApp) {
        switch (sessionType) {
            case SessionType.Practice:
                return (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Practice />
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
            sessionType={sessionType}
            setSessionType={setSessionType}
            fixedTime={fixedTime}
            setFixedTime={setFixedTime}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            setImageFiles={setImageFiles}
            setRunApp={setRunApp}
        />
    );
}
