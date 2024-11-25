import React, { useState, useEffect, useRef } from "react";

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

import type { SelectedFolder } from "../types/preferences";
import { SessionType } from "../types/session";
import { fixedTimeToMS } from "../utils/session";
import { SlideshowButton } from "../components/buttons";
import { ImageGrid, ProgressBar } from "../components/slideshow";
import { timerAlerts } from "../utils/alerts";
import { useToggle } from "../hooks/misc";
import { useImageManagement } from "../hooks/imageManagement";
import { GridIcon } from "../assets/icons";
import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";
import { useApp } from "../contexts/AppContext";

const INTERVAL_MS = 10;

export default function Slideshow({}) {
    const { preferences } = usePreferences();
    const { selectedFolder, imageFiles, setImageFiles, setRunApp, selectedSchedule } = useApp();

    // Image display variables
    const [showOverlay, toggleShowOverlay] = useToggle(false);

    // Progress and interval timer variables
    const [pause, togglePause] = useToggle(false);
    const [counter, setCounter] = useState(0);
    const sessionIntervals = preferences.sessionType === SessionType.Schedule ? selectedSchedule.toIntervals() : [];
    const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);

    const { currentImageUrl, next, prev, deleteCurrentImage, showImageInfo } = useImageManagement({
        imageFiles,
        setImageFiles,
        selectedFolder,
        sessionType: preferences.sessionType,
        sessionIntervals,
        currentIntervalIndex,
        setCurrentIntervalIndex,
        exit: () => setRunApp(false),
    });

    const getCurrentInterval = () => {
        if (preferences.sessionType === SessionType.Schedule) {
            return sessionIntervals[currentIntervalIndex];
        }
        return fixedTimeToMS(preferences.fixedTime);
    };
    const timeMS = getCurrentInterval();
    const TICKS_PER_SLIDE = timeMS / INTERVAL_MS;

    // Window resizing variables
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    const maxWidthRef = useRef<number>(window.innerWidth);
    const maxHeightRef = useRef<number>(window.innerHeight);
    const isAutoResizing = useRef(false);
    const resizeTimeoutId = useRef<number | null>(null);

    // Setup an interval timer
    const setupTimer = (): ReturnType<typeof setInterval> | null => {
        let timer: ReturnType<typeof setInterval> | null = null;
        if (!pause && preferences.sessionType != SessionType.Relaxed) {
            timer = setInterval(() => {
                setCounter((prev) => {
                    const remainingTicks = TICKS_PER_SLIDE - prev;
                    const remainingSeconds = (remainingTicks * INTERVAL_MS) / 1000;
                    // Play sounds at specific remaining times if not muted
                    if (!preferences.mute) {
                        if (remainingSeconds <= 3.01 && remainingSeconds > 2.99) {
                            timerAlerts.threeSec();
                        } else if (remainingSeconds <= 2.01 && remainingSeconds > 1.99) {
                            timerAlerts.twoSec();
                        } else if (remainingSeconds <= 1.01 && remainingSeconds > 0.99) {
                            timerAlerts.oneSec();
                        }
                    }
                    if (prev >= TICKS_PER_SLIDE) {
                        next();
                        return 0;
                    }
                    return prev + 1;
                });
            }, INTERVAL_MS);
        }
        return timer;
    };

    // Resize the window to fit the image if standalone
    useEffect(() => {
        if (isStandalone && preferences.resizeWindow) {
            isAutoResizing.current = true;
            if (resizeTimeoutId.current !== null) {
                clearTimeout(resizeTimeoutId.current);
            }
            resizeWindow(currentImageUrl, maxWidthRef.current, maxHeightRef.current);
            resizeTimeoutId.current = setTimeout(() => {
                isAutoResizing.current = false;
                resizeTimeoutId.current = null;
            }, 100);
        }
    }, [currentImageUrl, isStandalone]);

    useEffect(() => {
        // Keypresses
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                next();
            }
            if (event.key === "ArrowLeft") {
                prev();
            }
            if (event.key === " ") {
                togglePause();
            }
            if (event.key === "Escape") {
                setRunApp(false);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [currentImageUrl]);

    // Set up interval timer
    useEffect(() => {
        const timer = setupTimer();
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [currentImageUrl, pause, preferences.mute]);

    // Saves new max dims when user resizes window
    useEffect(() => {
        const handleResize = () => {
            if (!isAutoResizing.current) {
                maxWidthRef.current = window.innerWidth;
                maxHeightRef.current = window.innerHeight;
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
                <ProgressBar fraction={counter / TICKS_PER_SLIDE} />
            )}
            {showOverlay && (
                <ButtonOverlay
                    selectedFolder={selectedFolder}
                    pause={pause}
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
                <div className="flex justify-center space-x-4">
                    <SlideshowButton Icon={ChevronLeftIcon} onClick={() => prev()} size={"xl"} />
                    {preferences.sessionType != SessionType.Relaxed && (
                        <SlideshowButton Icon={pause ? PlayIcon : PauseIcon} onClick={togglePause} size={"xl"} />
                    )}
                    <SlideshowButton Icon={ChevronRightIcon} onClick={() => next()} size={"xl"} />
                </div>
            </div>
        </div>
    );
}

// Resize and reposition the window to fit the image
function resizeWindow(url: string, maxWidth: number, maxHeight: number) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
        const { width, height } = img;

        // Calculate scale factor based on the window size and the image dimensions
        const scaleWidth = maxWidth / width;
        const scaleHeight = maxHeight / height;
        const scaleFactor = Math.min(scaleWidth, scaleHeight);

        // Calculate the new dimensions based on the scale factor
        const newWidth = width * scaleFactor;
        const newHeight = height * scaleFactor;

        // Adjust the resize target to account for the browser UI space
        const browserUIWidth = window.outerWidth - window.innerWidth;
        const browserUIHeight = window.outerHeight - window.innerHeight;
        const adjustedWidth = newWidth + browserUIWidth;
        const adjustedHeight = newHeight + browserUIHeight;

        // Resize the window
        window.resizeTo(adjustedWidth, adjustedHeight);

        // Reposition the window so the resize is centered
        /*
        const currentLeft = window.screenX;
        const currentTop = window.screenY;
        const newLeft = currentLeft - (adjustedWidth - window.innerWidth) / 2;
        const newTop = currentTop - (adjustedHeight - window.innerHeight) / 2;
        window.moveTo(newLeft, newTop);
        */
    };
}
