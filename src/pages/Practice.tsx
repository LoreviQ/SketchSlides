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

import type { SelectedFolder } from "../types/folder";
import { FixedTime, fixedTimeToMS } from "../types/session";
import { SlideshowButton } from "../components/buttons";
import { ImageGrid, ProgressBar } from "../components/slideshow";
import { timerAlerts } from "../utils/alerts";
import { useToggle } from "../utils/hooks";
import { GridIcon } from "../assets/icons";

const INTERVAL_MS = 10;

interface PracticeProps {
    fixedTime: FixedTime;
    selectedFolder: SelectedFolder;
    imageFiles: File[];
    setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Practice({ fixedTime, selectedFolder, imageFiles, setImageFiles, setRunApp }: PracticeProps) {
    const [imageOrder, setImageOrder] = useState(() => generateRandomOrder(imageFiles.length));
    const [orderIndex, setOrderIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => URL.createObjectURL(imageFiles[orderIndex]));
    const [showOverlay, toggleShowOverlay] = useToggle(false);
    const [pause, togglePause] = useToggle(false);
    const [mute, toggleMute] = useToggle(false);
    const [grid, toggleGrid] = useToggle(false);
    const [flip, toggleFlip] = useToggle(false);
    const [greyscale, toggleGreyscale] = useToggle(false);
    const [timer, toggleTimer] = useToggle(false);
    const [counter, setCounter] = useState(0);
    const timeMS = fixedTimeToMS(fixedTime);
    const TICKS_PER_SLIDE = timeMS / INTERVAL_MS;
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    const maxWidthRef = useRef<number>(window.innerWidth);
    const maxHeightRef = useRef<number>(window.innerHeight);

    // Move to the next image in the order
    const next = () => {
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
        setOrderIndex(orderIndex - 1);
        setCounter(0);
    };

    const deleteCurrentFile = async () => {
        const currentFile = imageFiles[imageOrder[orderIndex]];
        const deletedValue = imageOrder[orderIndex];

        // Show confirmation dialog
        const confirmDelete = window.confirm(`Are you sure you want to delete:\n${currentFile.name}?`);
        if (!confirmDelete) return;

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
                return;
            }

            // Update image order: remove all instances of deletedValue and decrement higher values
            const removedBeforeCurrent = imageOrder.slice(0, orderIndex).filter((idx) => idx === deletedValue).length;
            const newOrder = imageOrder
                .filter((idx) => idx !== deletedValue)
                .map((idx) => (idx > deletedValue ? idx - 1 : idx));

            setImageOrder(newOrder);
            setImageFiles(newImageFiles);
            setOrderIndex(orderIndex - removedBeforeCurrent);
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file. Make sure you have permission to modify files in this folder.");
        }
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

        // Interval timer
        let timer: ReturnType<typeof setInterval> | null = null;
        if (!pause) {
            timer = setInterval(() => {
                setCounter((prev) => {
                    const remainingTicks = TICKS_PER_SLIDE - prev;
                    const remainingSeconds = (remainingTicks * INTERVAL_MS) / 1000;
                    // Play sounds at specific remaining times if not muted
                    if (!mute) {
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
        };

        window.addEventListener("keydown", handleKeyPress);

        // Cleanup function
        return () => {
            URL.revokeObjectURL(url);
            if (timer) clearInterval(timer);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [orderIndex, pause, mute]);

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
                className={`w-full h-full object-contain ${flip ? "scale-x-[-1]" : ""} ${greyscale ? "grayscale" : ""}`}
            />
            {grid && <ImageGrid />}
            {timer && <ProgressBar fraction={counter / TICKS_PER_SLIDE} />}
            {showOverlay && (
                <ButtonOverlay
                    orderIndex={orderIndex}
                    imageOrder={imageOrder}
                    imageFiles={imageFiles}
                    pause={pause}
                    mute={mute}
                    togglePause={togglePause}
                    toggleMute={toggleMute}
                    toggleGrid={toggleGrid}
                    toggleFlip={toggleFlip}
                    toggleGreyscale={toggleGreyscale}
                    toggleTimer={toggleTimer}
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
    mute: boolean;
    togglePause: () => void;
    toggleMute: () => void;
    toggleGrid: () => void;
    toggleFlip: () => void;
    toggleGreyscale: () => void;
    toggleTimer: () => void;
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
    next: () => void;
    prev: () => void;
    deleteCurrentFile: () => void;
}
function ButtonOverlay({
    orderIndex,
    imageOrder,
    imageFiles,
    pause,
    mute,
    togglePause,
    toggleMute,
    toggleGrid,
    toggleFlip,
    toggleGreyscale,
    toggleTimer,
    setRunApp,
    next,
    prev,
    deleteCurrentFile,
}: ButtonOverlayProps) {
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
                        onClick={() => {
                            deleteCurrentFile();
                            next();
                        }}
                    />
                    <SlideshowButton Icon={mute ? SpeakerXMarkIcon : SpeakerWaveIcon} onClick={toggleMute} />
                    <SlideshowButton Icon={Square2StackIcon} onClick={() => console.log("AOT button clicked")} />
                    <SlideshowButton Icon={GridIcon} onClick={toggleGrid} />
                    <SlideshowButton Icon={ArrowsRightLeftIcon} onClick={toggleFlip} />
                    <SlideshowButton Icon={BoltIcon} onClick={toggleGreyscale} />
                    <SlideshowButton Icon={ClockIcon} onClick={toggleTimer} />
                </div>
                <div className="flex justify-center space-x-4">
                    <SlideshowButton Icon={ChevronLeftIcon} onClick={() => prev()} size={"xl"} />
                    <SlideshowButton Icon={pause ? PlayIcon : PauseIcon} onClick={togglePause} size={"xl"} />
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
