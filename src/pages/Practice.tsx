import React, { useState, useEffect, useRef } from "react";

import { XCircleIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/outline";

import { FixedTime, fixedTimeToMS } from "../types/session";
import { SlideshowButton } from "../components/buttons";

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
    const timeMS = fixedTimeToMS(fixedTime);
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
        const timer = setInterval(() => {
            setNextIndex(orderIndex, setOrderIndex, imageOrder, setImageOrder, imageFiles.length);
        }, timeMS);

        // Keypresses
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                setNextIndex(orderIndex, setOrderIndex, imageOrder, setImageOrder, imageFiles.length);
            }
            if (event.key === "ArrowLeft") {
                setPrevIndex(orderIndex, setOrderIndex);
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        // Cleanup function
        return () => {
            URL.revokeObjectURL(url);
            clearInterval(timer);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [orderIndex]);

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
                className="max-w-full max-h-full object-contain"
            />
            {showOverlay && (
                <ButtonOverlay
                    setRunApp={setRunApp}
                    orderIndex={orderIndex}
                    setOrderIndex={setOrderIndex}
                    imageOrder={imageOrder}
                    setImageOrder={setImageOrder}
                    length={imageFiles.length}
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
}
function ButtonOverlay({
    setRunApp,
    orderIndex,
    setOrderIndex,
    imageOrder,
    setImageOrder,
    length,
}: ButtonOverlayProps) {
    return (
        <div className="absolute top-0 left-0 w-full h-full bg-transparent flex justify-center items-center">
            <div className="flex flex-col w-full h-full justify-between p-4">
                <div className="flex justify-left">
                    <SlideshowButton Icon={XCircleIcon} onClick={() => setRunApp(false)} />
                </div>
                <div className="flex justify-center space-x-4">
                    <SlideshowButton Icon={ChevronLeftIcon} onClick={() => setPrevIndex(orderIndex, setOrderIndex)} />
                    <SlideshowButton Icon={PauseIcon} onClick={() => console.log("Button 2 clicked")} />
                    <SlideshowButton
                        Icon={ChevronRightIcon}
                        onClick={() => setNextIndex(orderIndex, setOrderIndex, imageOrder, setImageOrder, length)}
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
}

// Move to the previous image in the order
function setPrevIndex(index: number, setIndex: React.Dispatch<React.SetStateAction<number>>) {
    if (index === 0) {
        return;
    }
    setIndex(index - 1);
}
