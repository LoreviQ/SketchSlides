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
    Square2StackIcon,
    ArrowsRightLeftIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";

import type { SelectedFolder } from "../types/preferences";
import { DEFAULT_SCHEDULE, SessionType } from "../types/session";
import { fixedTimeToMS } from "../utils/session";
import { SlideshowButton } from "../components/buttons";
import { ImageGrid, ProgressBar } from "../components/slideshow";
import { timerAlerts } from "../utils/alerts";
import { useToggle } from "../utils/hooks";
import { GridIcon } from "../assets/icons";

import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";

const INTERVAL_MS = 10;

interface SlideshowProps {
    selectedFolder: SelectedFolder;
    imageFiles: File[];
    setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Slideshow({ selectedFolder, imageFiles, setImageFiles, setRunApp }: SlideshowProps) {
    const { preferences } = usePreferences();

    // Image display variables
    const [imageOrder, setImageOrder] = useState(() => generateRandomOrder(imageFiles.length));
    const [orderIndex, setOrderIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => URL.createObjectURL(imageFiles[orderIndex]));
    const [showOverlay, toggleShowOverlay] = useToggle(false);

    // Progress and interval timer variables
    const [pause, togglePause] = useToggle(false);
    const [counter, setCounter] = useState(0);
    const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
    const [sessionIntervals, setSessionIntervals] = useState<number[]>(() =>
        preferences.sessionType === SessionType.Schedule ? DEFAULT_SCHEDULE.toIntervals() : []
    );

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

    // Move to the next image in the order
    const next = () => {
        // Progress to the next interval if in Session mode
        if (preferences.sessionType === SessionType.Schedule) {
            if (currentIntervalIndex + 1 >= sessionIntervals.length) {
                setRunApp(false);
                return;
            }
            setCurrentIntervalIndex(currentIntervalIndex + 1);
        }

        if (orderIndex === imageOrder.length - 1) {
            setImageOrder((imageOrder) => {
                const newOrder = [...imageOrder, ...generateRandomOrder(imageFiles.length)];
                setOrderIndex(orderIndex + 1);
                return newOrder;
            });
        } else {
            setOrderIndex(orderIndex + 1);
        }
        setCounter(0);
    };

    // Move to the previous image in the order
    const prev = () => {
        if (orderIndex === 0) {
            return;
        }
        // Progress to the previous interval if in class mode
        if (preferences.sessionType === SessionType.Schedule) {
            setCurrentIntervalIndex((prev) => (prev - 1 < 0 ? sessionIntervals.length - 1 : prev - 1));
        }
        setOrderIndex(orderIndex - 1);
        setCounter(0);
    };

    const deleteCurrentFile = async (): Promise<boolean> => {
        const currentFile = imageFiles[imageOrder[orderIndex]];
        const deletedValue = imageOrder[orderIndex];

        // Show confirmation dialog
        const confirmDelete = window.confirm(`Are you sure you want to delete:\n${currentFile.name}?`);
        if (!confirmDelete) return false;

        try {
            // Get file handle from the directory handle
            await selectedFolder.dirHandle.removeEntry(currentFile.name);

            // Update app state
            const newImageFiles = [...imageFiles];
            newImageFiles.splice(imageOrder[orderIndex], 1);

            // If no files left, return to settings
            if (newImageFiles.length === 0) {
                alert("No more images in folder. Returning to settings.");
                setRunApp(false);
                return true;
            }

            // Update image order: remove all instances of deletedValue and decrement higher values
            const removedBeforeCurrent = imageOrder.slice(0, orderIndex).filter((idx) => idx === deletedValue).length;
            const newOrder = imageOrder
                .filter((idx) => idx !== deletedValue)
                .map((idx) => (idx > deletedValue ? idx - 1 : idx));

            setImageOrder(newOrder);
            setImageFiles(newImageFiles);
            setOrderIndex(orderIndex - removedBeforeCurrent);
            return true;
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file. Make sure you have permission to modify files in this folder.");
            return false;
        }
    };

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
        if (isStandalone) {
            resizeWindow(currentImageUrl, maxWidthRef.current, maxHeightRef.current);
        }
    }, [currentImageUrl, isStandalone]);

    useEffect(() => {
        // Current image URL
        const fileIndex = imageOrder[orderIndex];
        const currentFile = imageFiles[fileIndex];
        const url = URL.createObjectURL(currentFile);
        setCurrentImageUrl(url);
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
            URL.revokeObjectURL(url);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [orderIndex]);

    // Set up interval timer
    useEffect(() => {
        const timer = setupTimer();
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [orderIndex, pause, preferences.mute]);

    useEffect(() => {
        // Set up resize handler
        const handleResize = () => {
            maxWidthRef.current = window.innerWidth;
            maxHeightRef.current = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            onClick={toggleShowOverlay}
            className="flex justify-center items-center h-screen bg-black overflow-hidden relative"
        >
            <img
                src={currentImageUrl}
                alt={`Image ${imageOrder[orderIndex] + 1}`}
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
                    orderIndex={orderIndex}
                    imageOrder={imageOrder}
                    imageFiles={imageFiles}
                    pause={pause}
                    togglePause={togglePause}
                    setRunApp={setRunApp}
                    next={() => next()}
                    prev={() => prev()}
                    deleteCurrentFile={deleteCurrentFile}
                />
            )}
        </div>
    );
}

interface ButtonOverlayProps {
    orderIndex: number;
    imageOrder: number[];
    imageFiles: File[];
    pause: boolean;
    togglePause: () => void;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
    next: () => void;
    prev: () => void;
    deleteCurrentFile: () => Promise<boolean>;
}
function ButtonOverlay({
    orderIndex,
    imageOrder,
    imageFiles,
    pause,
    togglePause,
    setRunApp,
    next,
    prev,
    deleteCurrentFile,
}: ButtonOverlayProps) {
    const { preferences, updatePreferences } = usePreferences();
    const updateMute = preferenceUpdater("mute", updatePreferences);
    const updateGrid = preferenceUpdater("grid", updatePreferences);
    const updateFlip = preferenceUpdater("flip", updatePreferences);
    const updateGreyscale = preferenceUpdater("greyscale", updatePreferences);
    const updateTimer = preferenceUpdater("timer", updatePreferences);

    // Alerts the user with information about the current image
    const showImageInfo = () => {
        const currentFile = imageFiles[imageOrder[orderIndex]];
        const img = document.querySelector("img"); // Use the existing image element
        const fullPath = currentFile.webkitRelativePath ? `${currentFile.webkitRelativePath}` : `${currentFile.name}`;

        const info = `File Information:
    - Name: ${fullPath}
    - Type: ${currentFile.type}
    - Size: ${(currentFile.size / (1024 * 1024)).toFixed(2)} MB
    - Last Modified: ${new Date(currentFile.lastModified).toLocaleString()}
    
    Image Properties:
    - Dimensions: ${img?.naturalWidth} x ${img?.naturalHeight} pixels
    - Aspect Ratio: ${img ? (img.width / img.height).toFixed(2) : "N/A"}`;

        alert(info);
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-transparent flex justify-center items-center">
            <div className="flex flex-col-reverse w-full h-full p-4">
                <div className="flex justify-center space-x-4 pt-12 pb-2">
                    <SlideshowButton Icon={XMarkIcon} onClick={() => setRunApp(false)} />
                    <SlideshowButton Icon={InformationCircleIcon} onClick={showImageInfo} />
                    <SlideshowButton
                        Icon={TrashIcon}
                        onClick={async () => {
                            const success = await deleteCurrentFile();
                            if (success) {
                                next();
                            }
                        }}
                    />
                    {preferences.sessionType != SessionType.Relaxed && (
                        <SlideshowButton
                            Icon={preferences.mute ? SpeakerXMarkIcon : SpeakerWaveIcon}
                            onClick={() => updateMute(!preferences.mute)}
                        />
                    )}
                    <SlideshowButton Icon={Square2StackIcon} onClick={() => console.log("AOT button clicked")} />
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

        // Move the window so the resize is centered
        const currentLeft = window.screenX;
        const currentTop = window.screenY;
        const newLeft = currentLeft - (adjustedWidth - window.innerWidth) / 2;
        const newTop = currentTop - (adjustedHeight - window.innerHeight) / 2;

        // Resize and reposition the window
        window.resizeTo(adjustedWidth, adjustedHeight);
        window.moveTo(newLeft, newTop);
    };
}

// Generate a random order of indices for an array of length
function generateRandomOrder(length: number): number[] {
    const MAX_RANDOM_LEN = 50;
    const numIndexes = Math.min(MAX_RANDOM_LEN, length);

    // More efficient to shuffle if length is small
    if (numIndexes > length / 2) {
        const order = Array.from({ length }, (_, i) => i);
        for (let i = 0; i < numIndexes; i++) {
            const j = i + Math.floor(Math.random() * (length - i));
            [order[i], order[j]] = [order[j], order[i]];
        }
        return order.slice(0, numIndexes);
    }

    // Otherwise, use a set to ensure uniqueness
    const result = new Set<number>();
    while (result.size < numIndexes) {
        result.add(Math.floor(Math.random() * length));
    }
    return Array.from(result);
}
