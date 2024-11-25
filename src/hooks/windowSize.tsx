import { useEffect, useRef } from "react";

interface WindowDims {
    width: number;
    height: number;
}

interface ResizeConfig {
    enabled: boolean;
    isStandalone: boolean;
    currentImageUrl: string;
}

export const useWindowResize = ({ enabled, isStandalone, currentImageUrl }: ResizeConfig) => {
    const maxDimsRef = useRef<WindowDims>({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const isAutoResizing = useRef(false);
    const resizeTimeoutId = useRef<number | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (!isAutoResizing.current) {
                maxDimsRef.current = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!enabled || !isStandalone) {
            return;
        }
        isAutoResizing.current = true;
        if (resizeTimeoutId.current) {
            clearTimeout(resizeTimeoutId.current);
        }
        resizeWindow(currentImageUrl, maxDimsRef.current.width, maxDimsRef.current.height);
        resizeTimeoutId.current = window.setTimeout(() => {
            isAutoResizing.current = false;
            resizeTimeoutId.current = null;
        }, 100);
    }, [currentImageUrl, enabled, isStandalone]);
};

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
