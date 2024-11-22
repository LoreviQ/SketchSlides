import React, { useState, useEffect } from "react";

import { FixedTime, fixedTimeToMS } from "../types/session";

import { SlideshowButton } from "../components/buttons";

interface PracticeProps {
    fixedTime: FixedTime;
    imageFiles: File[];
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Practice({ fixedTime, imageFiles, setRunApp }: PracticeProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const timeMS = fixedTimeToMS(fixedTime);

    // Update the current image index based on an interval of timeMS
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageFiles.length);
        }, timeMS);

        return () => clearInterval(timer);
    }, []);

    // Update the current image URL based on the current image index
    useEffect(() => {
        const currentFile = imageFiles[currentImageIndex];
        if (currentFile) {
            const url = URL.createObjectURL(currentFile);
            setCurrentImageUrl(url);

            // Clean up the previous URL
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFiles, currentImageIndex]);

    return (
        <div
            onClick={() => setShowOverlay(!showOverlay)}
            className="flex justify-center items-center h-screen bg-black overflow-hidden relative"
        >
            {currentImageUrl ? (
                <>
                    <img
                        src={currentImageUrl}
                        alt={`Image ${currentImageIndex + 1}`}
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
