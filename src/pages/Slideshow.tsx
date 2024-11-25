// React imports
import React, { useState } from "react";

// External imports
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PauseIcon,
    PlayIcon,
    InformationCircleIcon,
    TrashIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsRightLeftIcon,
    ClockIcon,
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";

// My Types
import type { SelectedFolder } from "../types/preferences";
import { SessionType } from "../types/session";
// My Components
import { SlideshowButton } from "../components/buttons";
import { ImageGrid, ProgressBar } from "../components/slideshow";
// My Hooks
import { useToggle } from "../hooks/misc";
import { useImageManagement } from "../hooks/image";
import { useTimer } from "../hooks/timer";
import { useKeyboardControls } from "../hooks/keyboard";
import { useWindowResize } from "../hooks/windowSize";
// My Assets
import { GridIcon } from "../assets/icons";
// My Contexts
import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";
import { useApp } from "../contexts/AppContext";

export default function Slideshow({}) {
    const { preferences } = usePreferences();
    const { selectedFolder, imageFiles, setRunApp, selectedSchedule, deleteFile } = useApp();
    const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
    const [showOverlay, toggleShowOverlay] = useToggle(false);
    const sessionIntervals = preferences.sessionType === SessionType.Schedule ? selectedSchedule.toIntervals() : [];
    // Custom hook for managing the image order and URL
    const { currentImageUrl, next, prev, deleteCurrentImage, showImageInfo } = useImageManagement({
        imageFiles,
        sessionType: preferences.sessionType,
        sessionIntervals,
        currentIntervalIndex,
        setCurrentIntervalIndex,
        exit: () => setRunApp(false),
        deleteFile,
    });
    // Custom hook for managing the timer
    const { counter, ticksPerSlide, isPaused, togglePause } = useTimer({
        currentImageUrl,
        sessionType: preferences.sessionType,
        fixedTime: preferences.fixedTime,
        isMuted: preferences.mute,
        sessionIntervals,
        currentIntervalIndex,
        onComplete: () => next(),
    });
    // Custom hook for enabling keyboard controls
    useKeyboardControls({
        onNext: next,
        onPrev: prev,
        onPause: togglePause,
        onExit: () => setRunApp(false),
    });

    // Custom hook for enabling window resizing
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    useWindowResize({ enabled: preferences.resizeWindow, isStandalone, currentImageUrl });

    return (
        <div onClick={toggleShowOverlay} className="flex justify-center items-center h-screen overflow-hidden relative">
            <img
                src={currentImageUrl}
                alt={`Image ${currentImageUrl}`}
                className={`w-full h-full object-contain ${preferences.flip ? "scale-x-[-1]" : ""} ${
                    preferences.greyscale ? "grayscale" : ""
                }`}
            />
            {preferences.grid && <ImageGrid />}
            {preferences.timer && preferences.sessionType != SessionType.Relaxed && (
                <ProgressBar currentTicks={counter} totalTicks={ticksPerSlide} />
            )}
            {showOverlay && (
                <ButtonOverlay
                    selectedFolder={selectedFolder}
                    pause={isPaused}
                    togglePause={togglePause}
                    setRunApp={setRunApp}
                    next={() => next()}
                    prev={() => prev()}
                    deleteCurrentImage={deleteCurrentImage}
                    showImageInfo={showImageInfo}
                />
            )}
        </div>
    );
}

interface ButtonOverlayProps {
    selectedFolder: SelectedFolder | null;
    pause: boolean;
    togglePause: () => void;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
    next: () => void;
    prev: () => void;
    deleteCurrentImage: () => Promise<boolean>;
    showImageInfo: () => string;
}
function ButtonOverlay({
    selectedFolder,
    pause,
    togglePause,
    setRunApp,
    next,
    prev,
    deleteCurrentImage,
    showImageInfo,
}: ButtonOverlayProps) {
    const { preferences, updatePreferences } = usePreferences();
    const updateMute = preferenceUpdater("mute", updatePreferences);
    const updateGrid = preferenceUpdater("grid", updatePreferences);
    const updateFlip = preferenceUpdater("flip", updatePreferences);
    const updateGreyscale = preferenceUpdater("greyscale", updatePreferences);
    const updateTimer = preferenceUpdater("timer", updatePreferences);
    const updateResizeWindow = preferenceUpdater("resizeWindow", updatePreferences);
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    const hasDirectoryAccess = "showDirectoryPicker" in window && selectedFolder?.dirHandle;

    // Alerts the user with information about the current image
    const handleShowInfo = () => {
        const info = showImageInfo();
        const img = document.querySelector("img");
        const additionalInfo = img
            ? `
    
Image Properties:
    - Dimensions: ${img.naturalWidth} x ${img.naturalHeight} pixels
    - Aspect Ratio: ${(img.width / img.height).toFixed(2)}`
            : "";

        alert(info + additionalInfo);
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-transparent flex justify-center items-center">
            <div className="flex flex-col-reverse w-full h-full p-4">
                <div className="flex justify-center space-x-4 pt-12 pb-2">
                    <div className="bg-black/50 rounded-full flex space-x-2 p-2">
                        <SlideshowButton Icon={XMarkIcon} onClick={() => setRunApp(false)} />
                        <SlideshowButton Icon={InformationCircleIcon} onClick={handleShowInfo} />
                        {/* Delete functionality is only supported via the showDirectoryPicker API */}
                        {hasDirectoryAccess && (
                            <SlideshowButton
                                Icon={TrashIcon}
                                onClick={async () => {
                                    const success = await deleteCurrentImage();
                                    if (success) {
                                        next();
                                    }
                                }}
                            />
                        )}
                        {preferences.sessionType != SessionType.Relaxed && (
                            <SlideshowButton
                                Icon={preferences.mute ? SpeakerXMarkIcon : SpeakerWaveIcon}
                                onClick={() => updateMute(!preferences.mute)}
                            />
                        )}
                        {/* Resize functionality is only supported in standalone mode */}
                        {isStandalone && (
                            <SlideshowButton
                                Icon={preferences.resizeWindow ? ArrowsPointingOutIcon : ArrowsPointingInIcon}
                                onClick={() => updateResizeWindow(!preferences.resizeWindow)}
                            />
                        )}
                        <SlideshowButton Icon={GridIcon} onClick={() => updateGrid(!preferences.grid)} />
                        <SlideshowButton Icon={ArrowsRightLeftIcon} onClick={() => updateFlip(!preferences.flip)} />
                        <SlideshowButton Icon={BoltIcon} onClick={() => updateGreyscale(!preferences.greyscale)} />
                        {preferences.sessionType != SessionType.Relaxed && (
                            <SlideshowButton Icon={ClockIcon} onClick={() => updateTimer(!preferences.timer)} />
                        )}
                    </div>
                </div>
                <div className="flex justify-center space-x-4">
                    <SlideshowButton Icon={ChevronLeftIcon} onClick={() => prev()} size={"xl"} showBg={true} />
                    {preferences.sessionType != SessionType.Relaxed && (
                        <SlideshowButton
                            Icon={pause ? PlayIcon : PauseIcon}
                            onClick={togglePause}
                            size={"xl"}
                            showBg={true}
                        />
                    )}
                    <SlideshowButton Icon={ChevronRightIcon} onClick={() => next()} size={"xl"} showBg={true} />
                </div>
            </div>
        </div>
    );
}
