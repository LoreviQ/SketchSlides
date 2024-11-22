import { SessionType, FixedTime } from "./../types/session";
import { ToggleButton } from "./../components/buttons";
import { formatFileSize } from "./../utils/formatters";

interface SettingsProps {
    sessionType: SessionType;
    setSessionType: React.Dispatch<React.SetStateAction<SessionType>>;
    fixedTime: FixedTime;
    setFixedTime: React.Dispatch<React.SetStateAction<FixedTime>>;
    selectedFolder: null | { name: string; items: number; totalSize: number };
    setSelectedFolder: React.Dispatch<React.SetStateAction<null | { name: string; items: number; totalSize: number }>>;
    setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Settings({
    sessionType,
    setSessionType,
    fixedTime,
    setFixedTime,
    selectedFolder,
    setSelectedFolder,
    setImageFiles,
    setRunApp,
}: SettingsProps) {
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

            if (files.length === 0) {
                alert("No image files found in the selected folder");
                return;
            }
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);

            setSelectedFolder({
                name: dirHandle.name,
                items: files.length,
                totalSize: totalSize,
            });

            setImageFiles(files);
        } catch (err) {
            console.error("Error selecting folder:", err);
            if (err instanceof Error && err.name !== "AbortError") {
                alert("An error occurred while selecting the folder");
            }
        }
    };

    return (
        <div className="w-full max-w-2xl p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center dark:text-white">DrawIt</h1>

            <div className="space-y-4">
                <button
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={handleFolderSelect}
                >
                    Select Folder
                </button>

                {selectedFolder ? (
                    <div>
                        <p className="dark:text-white font-medium">{selectedFolder.name}</p>
                        <p className="dark:text-white text-sm">
                            {selectedFolder.items} items • {formatFileSize(selectedFolder.totalSize)}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No folder selected</p>
                )}

                <hr className="border-gray-300 dark:border-gray-700" />

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold dark:text-white">Session Type</h2>
                    <div className="flex gap-2">
                        {Object.values(SessionType).map((type) => (
                            <ToggleButton
                                key={type}
                                label={type}
                                isSelected={sessionType === type}
                                setter={setSessionType}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold dark:text-white">Fixed Time</h2>
                    <div className="flex gap-2">
                        {Object.values(FixedTime).map((time) => (
                            <ToggleButton
                                key={time}
                                label={time}
                                isSelected={fixedTime === time}
                                setter={setFixedTime}
                            />
                        ))}
                    </div>
                </div>
                <button
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    onClick={() => setRunApp(true)}
                >
                    Start
                </button>
            </div>
        </div>
    );
}
