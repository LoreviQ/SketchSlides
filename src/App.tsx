import { useState } from "react";
import "./App.css";

import { SessionType, FixedTime } from "./types/session";
import { Settings } from "./pages/settings";

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
        return <div> APP HERE</div>;
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
