import React, { useState, useEffect, useRef } from "react";

import {
    XCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PauseIcon,
    PlayIcon,
    InformationCircleIcon,
    FolderIcon,
    TrashIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    Square2StackIcon,
    ArrowsRightLeftIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { Squares2X2Icon, BoltIcon } from "@heroicons/react/24/solid";

import { FixedTime, fixedTimeToMS } from "../types/session";
import { SlideshowButton } from "../components/buttons";
import { ProgressBar } from "../components/progressBars";

const INTERVAL_MS = 10;

interface PracticeProps {
    fixedTime: FixedTime;
    imageFiles: File[];
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Practice({ fixedTime, imageFiles, setRunApp }: PracticeProps) {
    const [imageOrder, setImageOrder] = useState(() => generateRandomOrder(imageFiles.length));
    const [orderIndex, setOrderIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => URL.createObjectURL(imageFiles[orderIndex]));
    const [showOverlay, setShowOverlay] = useState(false);
    const [pause, setPause] = useState(false);
    const [mute, setMute] = useState(false);
    const [counter, setCounter] = useState(0);
    const timeMS = fixedTimeToMS(fixedTime);
    const TICKS_PER_SLIDE = timeMS / INTERVAL_MS;
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    const maxWidthRef = useRef<number>(window.innerWidth);
    const maxHeightRef = useRef<number>(window.innerHeight);

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
                    if (prev >= TICKS_PER_SLIDE) {
                        setNextIndex(
                            orderIndex,
                            setOrderIndex,
                            imageOrder,
                            setImageOrder,
                            setCounter,
                            imageFiles.length
                        );
                        return 0;
                    }
                    return prev + 1;
                });
            }, INTERVAL_MS);
        }

        // Keypresses
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                setNextIndex(orderIndex, setOrderIndex, imageOrder, setImageOrder, setCounter, imageFiles.length);
            }
            if (event.key === "ArrowLeft") {
                setPrevIndex(orderIndex, setOrderIndex, setCounter);
            }
            if (event.key === " ") {
                setPause(!pause);
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        // Cleanup function
        return () => {
            URL.revokeObjectURL(url);
            if (timer) clearInterval(timer);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [orderIndex, pause]);

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
            onClick={() => setShowOverlay(!showOverlay)}
            className="flex justify-center items-center h-screen bg-black overflow-hidden relative"
        >
            <img
                src={currentImageUrl}
                alt={`Image ${imageOrder[orderIndex] + 1}`}
                className="w-full h-full object-contain"
            />
            <ProgressBar fraction={counter / TICKS_PER_SLIDE} />
            {showOverlay && (
                <ButtonOverlay
                    setRunApp={setRunApp}
                    orderIndex={orderIndex}
                    setOrderIndex={setOrderIndex}
                    imageOrder={imageOrder}
                    setImageOrder={setImageOrder}
                    length={imageFiles.length}
                    pause={pause}
                    setPause={setPause}
                    mute={mute}
                    setMute={setMute}
                    setCounter={setCounter}
                />
            )}
        </div>
    );
}

interface ButtonOverlayProps {
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
    orderIndex: number;
    setOrderIndex: React.Dispatch<React.SetStateAction<number>>;
    imageOrder: number[];
    setImageOrder: React.Dispatch<React.SetStateAction<number[]>>;
    length: number;
    pause: boolean;
    setPause: React.Dispatch<React.SetStateAction<boolean>>;
    mute: boolean;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    setCounter: React.Dispatch<React.SetStateAction<number>>;
}
function ButtonOverlay({
    setRunApp,
    orderIndex,
    setOrderIndex,
    imageOrder,
    setImageOrder,
    length,
    pause,
    setPause,
    mute,
    setMute,
    setCounter,
}: ButtonOverlayProps) {
    return (
        <div className="absolute top-0 left-0 w-full h-full bg-transparent flex justify-center items-center">
            <div className="flex flex-col-reverse w-full h-full p-4">
                <div className="flex justify-center space-x-4 pt-12 pb-2">
                    <SlideshowButton Icon={XCircleIcon} onClick={() => setRunApp(false)} />
                    <SlideshowButton Icon={InformationCircleIcon} onClick={() => console.log("Info button clicked")} />
                    <SlideshowButton Icon={FolderIcon} onClick={() => console.log("Folder button clicked")} />
                    <SlideshowButton Icon={TrashIcon} onClick={() => console.log("Trash button clicked")} />
                    <SlideshowButton Icon={mute ? SpeakerXMarkIcon : SpeakerWaveIcon} onClick={() => setMute(!mute)} />
                    <SlideshowButton Icon={Square2StackIcon} onClick={() => console.log("AOT button clicked")} />
                    <SlideshowButton Icon={Squares2X2Icon} onClick={() => console.log("Grid button clicked")} />
                    <SlideshowButton Icon={ArrowsRightLeftIcon} onClick={() => console.log("Flip button clicked")} />
                    <SlideshowButton Icon={BoltIcon} onClick={() => console.log("Greyscale button clicked")} />
                    <SlideshowButton Icon={ClockIcon} onClick={() => console.log("Timer button clicked")} />
                </div>
                <div className="flex justify-center space-x-4">
                    <SlideshowButton
                        Icon={ChevronLeftIcon}
                        onClick={() => setPrevIndex(orderIndex, setOrderIndex, setCounter)}
                        size={"xl"}
                    />
                    <SlideshowButton Icon={pause ? PlayIcon : PauseIcon} onClick={() => setPause(!pause)} size={"xl"} />
                    <SlideshowButton
                        Icon={ChevronRightIcon}
                        onClick={() =>
                            setNextIndex(orderIndex, setOrderIndex, imageOrder, setImageOrder, setCounter, length)
                        }
                        size={"xl"}
                    />
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

// Move to the next image in the order
function setNextIndex(
    index: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    order: number[],
    setOrder: React.Dispatch<React.SetStateAction<number[]>>,
    setCounter: React.Dispatch<React.SetStateAction<number>>,
    length: number
) {
    if (index === order.length - 1) {
        setOrder((order) => {
            const newOrder = [...order, ...generateRandomOrder(length)];
            setIndex(index + 1);
            return newOrder;
        });
    } else {
        setIndex(index + 1);
    }
    setCounter(0);
}

// Move to the previous image in the order
function setPrevIndex(
    index: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    setCounter: React.Dispatch<React.SetStateAction<number>>
) {
    if (index === 0) {
        return;
    }
    setIndex(index - 1);
    setCounter(0);
}
