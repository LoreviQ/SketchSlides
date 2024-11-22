import React, { useState, useEffect } from "react";

import { FixedTime, fixedTimeToMS } from "../types/session";

import ExitIcon from "../assets/exit.svg";

interface PracticeProps {
    fixedTime: FixedTime;
    imageFiles: File[];
    setRunApp: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Practice({ fixedTime, imageFiles, setRunApp }: PracticeProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
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
        <div className="flex justify-center items-center h-screen bg-black overflow-hidden">
            {currentImageUrl ? (
                <img
                    src={currentImageUrl}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                />
            ) : (
                <p style={{ color: "#fff" }}>No images to display</p>
            )}
        </div>
    );
}
