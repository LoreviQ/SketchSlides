import React, { useState, useEffect } from "react";
import { FixedTime, fixedTimeToMS } from "../types/session";

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
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh", // Full viewport height
                backgroundColor: "#000", // Background color for better focus on images
                overflow: "hidden", // Ensure no scrollbars appear
            }}
        >
            {currentImageUrl ? (
                <img
                    src={currentImageUrl}
                    alt={`Image ${currentImageIndex + 1}`}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain", // Ensures no cropping
                    }}
                />
            ) : (
                <p style={{ color: "#fff" }}>No images to display</p>
            )}
        </div>
    );
}
