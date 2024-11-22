import React, { useState, useEffect, useRef } from "react";

import { FixedTime, fixedTimeToMS } from "../types/session";

import { SlideshowButton } from "../components/buttons";

interface PracticeProps {
    fixedTime: FixedTime;
    imageFiles: File[];
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Practice({ fixedTime, imageFiles, setRunApp }: PracticeProps) {
    const [imageOrder, setImageOrder] = useState<number[]>(generateRandomOrder(imageFiles.length));
    const [orderIndex, setOrderIndex] = useState(imageOrder[0]);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(URL.createObjectURL(imageFiles[orderIndex]));
    const [showOverlay, setShowOverlay] = useState(false);
    const timeMS = fixedTimeToMS(fixedTime);
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    const maxWidthRef = useRef<number>(window.innerWidth);
    const maxHeightRef = useRef<number>(window.innerHeight);

    // Update the current image index based on an interval of timeMS
    useEffect(() => {
        const timer = setInterval(() => {
            setOrderIndex((prevIndex) => {
                const currentPosition = imageOrder.indexOf(prevIndex);
                const nextPosition = (currentPosition + 1) % imageFiles.length;
                if (nextPosition === 0) {
                    setImageOrder(generateRandomOrder(imageFiles.length));
                }
                return imageOrder[nextPosition];
            });
        }, timeMS);

        return () => clearInterval(timer);
    }, []);

    // Update the current image URL based on the current image index
    useEffect(() => {
        const currentFile = imageFiles[orderIndex];
        if (currentFile) {
            const url = URL.createObjectURL(currentFile);
            setCurrentImageUrl(url);
            // Resize the window to fit the image if standalone
            if (isStandalone) {
                resizeWindow(url, maxWidthRef.current, maxHeightRef.current);
            }
            // Clean up the previous URL
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFiles, orderIndex]);

    // Listen for window resize events and update maxWidth and maxHeight accordingly
    useEffect(() => {
        const handleResize = () => {
            maxWidthRef.current = window.innerWidth;
            maxHeightRef.current = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            onClick={() => setShowOverlay(!showOverlay)}
            className="flex justify-center items-center h-screen bg-black overflow-hidden relative"
        >
            {currentImageUrl ? (
                <>
                    <img
                        src={currentImageUrl}
                        alt={`Image ${orderIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                    />
                    {showOverlay && <ButtonOverlay setRunApp={setRunApp} />}
                </>
            ) : (
                <p style={{ color: "#fff" }}>No images to display</p>
            )}
        </div>
    );
}

interface ButtonOverlayProps {
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
function ButtonOverlay({ setRunApp }: ButtonOverlayProps) {
    return (
        <div className="absolute top-0 left-0 w-full h-full bg-transparent flex justify-center items-center">
            <div className="flex flex-col w-full h-full justify-between p-4">
                <div className="flex justify-left">
                    <SlideshowButton setter={setRunApp} />
                </div>
                <div className="flex justify-between">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={() => console.log("Button 2 clicked")}
                    >
                        Button 2
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md"
                        onClick={() => console.log("Button 3 clicked")}
                    >
                        Button 3
                    </button>
                </div>
            </div>
        </div>
    );
}

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

function generateRandomOrder(length: number): number[] {
    const order = Array.from({ length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
}
