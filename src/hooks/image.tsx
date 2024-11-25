import { useState, useEffect, useCallback } from "react";
import { SessionType } from "../types/session";

interface ImageManagementConfig {
    imageFiles: File[];
    sessionType: SessionType;
    sessionIntervals?: number[];
    currentIntervalIndex?: number;
    setCurrentIntervalIndex?: React.Dispatch<React.SetStateAction<number>>;
    exit: () => void;
    deleteFile: (index: number) => Promise<boolean>;
}
interface ImageManagementReturn {
    currentImageUrl: string;
    next: () => void;
    prev: () => void;
    deleteCurrentImage: () => Promise<boolean>;
    showImageInfo: () => string;
}
export const useImageManagement = ({
    imageFiles,
    sessionType,
    sessionIntervals = [],
    currentIntervalIndex = 0,
    setCurrentIntervalIndex,
    exit,
    deleteFile,
}: ImageManagementConfig): ImageManagementReturn => {
    const [imageOrder, setImageOrder] = useState(() => generateRandomOrder(imageFiles.length));
    const [orderIndex, setOrderIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(() =>
        URL.createObjectURL(imageFiles[imageOrder[0]])
    );

    // Update image URL when order index changes
    useEffect(() => {
        const fileIndex = imageOrder[orderIndex];
        const url = URL.createObjectURL(imageFiles[fileIndex]);
        setCurrentImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [orderIndex, imageOrder, imageFiles]);

    const next = useCallback(() => {
        // Handle session intervals if in Schedule mode
        if (sessionType === SessionType.Schedule && setCurrentIntervalIndex) {
            if (currentIntervalIndex + 1 >= sessionIntervals.length) {
                exit();
                return;
            }
            setCurrentIntervalIndex(currentIntervalIndex + 1);
        }

        // Handle image order
        if (orderIndex === imageOrder.length - 1) {
            setImageOrder((imageOrder) => {
                const newOrder = [...imageOrder, ...generateRandomOrder(imageFiles.length)];
                // setOrderIndex is within setImageOrder so aysnc doesn't cause issues
                setOrderIndex(orderIndex + 1);
                return newOrder;
            });
        } else {
            setOrderIndex(orderIndex + 1);
        }
        // possible set counter to 0 here
    }, [orderIndex]);

    const prev = useCallback(() => {
        if (orderIndex === 0) return;

        // Revert to the previous interval if in Schedule mode
        if (sessionType === SessionType.Schedule && setCurrentIntervalIndex) {
            setCurrentIntervalIndex((prev) => (prev - 1 < 0 ? sessionIntervals.length - 1 : prev - 1));
        }
        setOrderIndex(orderIndex - 1);
    }, [orderIndex]);

    const deleteCurrentImage = useCallback(async (): Promise<boolean> => {
        const fileIndex = imageOrder[orderIndex];
        const success = await deleteFile(fileIndex);
        if (success) {
            if (imageFiles.length <= 1) {
                exit();
                return true;
            }

            // Update image order: remove all instances of deleted file and decrement higher values
            const removedBeforeCurrent = imageOrder.slice(0, orderIndex).filter((idx) => idx === fileIndex).length;
            const newOrder = imageOrder
                .filter((idx) => idx !== fileIndex)
                .map((idx) => (idx > fileIndex ? idx - 1 : idx));
            const newIndex = orderIndex - removedBeforeCurrent;
            setImageOrder((prevOrder) => {
                setOrderIndex((_) => {
                    return Math.max(0, Math.min(newIndex, prevOrder.length - 1));
                });
                return newOrder;
            });
        }
        return success;
    }, [orderIndex, imageOrder, deleteFile]);

    const showImageInfo = useCallback((): string => {
        const currentFile = imageFiles[imageOrder[orderIndex]];
        const fullPath = currentFile.webkitRelativePath ? `${currentFile.webkitRelativePath}` : `${currentFile.name}`;

        return `File Information:
    - Name: ${fullPath}
    - Type: ${currentFile.type}
    - Size: ${(currentFile.size / (1024 * 1024)).toFixed(2)} MB
    - Last Modified: ${new Date(currentFile.lastModified).toLocaleString()}`;
    }, [orderIndex]);

    return {
        currentImageUrl,
        next,
        prev,
        deleteCurrentImage,
        showImageInfo,
    };
};

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
