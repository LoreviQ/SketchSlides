import { useState } from "react";
import "./App.css";

import type { SelectedFolder } from "./types/preferences";
import Settings from "./pages/Settings";
import Slideshow from "./pages/Slideshow";

export default function App() {
    const [selectedFolder, setSelectedFolder] = useState<null | SelectedFolder>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [runApp, setRunApp] = useState(false);

    if (runApp && selectedFolder) {
        return (
            <Slideshow
                selectedFolder={selectedFolder}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                setRunApp={setRunApp}
            />
        );
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
