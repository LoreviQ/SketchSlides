import { useState, useEffect } from "react";
import type { SelectedFolder } from "../types/preferences";
import { saveLastFolder, getLastFolder } from "../utils/indexDB";
import { logger } from '../utils/logger';

interface FileManagerState {
    selectedFolder: SelectedFolder | null;
    imageFiles: File[];
    isDragging: boolean;
}

interface FileManagerActions {
    handleFolderSelect: () => Promise<void>;
    handleFileSelect: () => void;
    deleteFile: (index: number) => Promise<boolean>;
}

export function useFileManager(runApp: boolean): FileManagerState & FileManagerActions {
    const [selectedFolder, setSelectedFolder] = useState<SelectedFolder | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Handle files opened via the launch queue
    useEffect(() => {
        if ("launchQueue" in window) {
            (window as any).launchQueue.setConsumer(async (launchParams: any) => {
                if (!launchParams.files.length) return;

                const files = await Promise.all(
                    launchParams.files.map((handle: FileSystemFileHandle) => handle.getFile())
                );

                const imageFiles = files.filter((file) => file.type.startsWith("image/"));
                if (imageFiles.length === 0) return;

                const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
                setSelectedFolder({
                    name: "Opened Files",
                    items: imageFiles.length,
                    totalSize: totalSize,
                    dirHandle: null,
                });
                setImageFiles(imageFiles);
            });
        }
    }, []);

    const updateFolderData = async (dirHandle: FileSystemDirectoryHandle) => {
        const files = await FileScanner(dirHandle);
        if (files.length === 0) {
            alert("No image files found in the selected folder");
            return;
        }
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        setSelectedFolder({
            name: dirHandle.name,
            items: files.length,
            totalSize: totalSize,
            dirHandle: dirHandle,
        });
        setImageFiles(files);
    };

    const handleFolderSelect = async () => {
        if (!("showDirectoryPicker" in window)) {
            logger.error(new Error('showDirectoryPicker not supported'), {
                context: 'FileManager'
            });
            return;
        }
        try {
            const dirHandle = await window.showDirectoryPicker();
            await updateFolderData(dirHandle);
            await saveLastFolder(dirHandle);
            logger.track('folder_selected', { 
                context: 'FileManager',
                data: { name: dirHandle.name }
            });
        } catch (err) {
            logger.error(err, { 
                context: 'FileManager',
                data: { action: 'folder_select' }
            });
            if (err instanceof Error && err.name !== "AbortError") {
                alert("An error occurred while selecting the folder");
            }
        }
    };

    const handleFileSelect = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "image/*";

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = Array.from(target.files || []).filter((file) => file.type.startsWith("image/"));

            if (files.length === 0) {
                alert("No image files selected");
                return;
            }

            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            setSelectedFolder({
                name: "Selected Files",
                items: files.length,
                totalSize: totalSize,
                dirHandle: null,
            });
            setImageFiles(files);
        };
        input.click();
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const items = Array.from(e.dataTransfer?.files || []).filter((file): file is File =>
            file.type.startsWith("image/")
        );
        if (items.length === 0) {
            alert("No image files found in drop");
            return;
        }
        const totalSize = items.reduce((sum, file) => sum + file.size, 0);
        setSelectedFolder({
            name: "Dropped Files",
            items: items.length,
            totalSize: totalSize,
            dirHandle: null,
        });
        setImageFiles(items);
    };

    useEffect(() => {
        if (runApp) return;

        const restoreLastFolder = async () => {
            try {
                const handle = await getLastFolder();
                if (!handle) {
                    logger.debug('No previous folder found', { 
                        context: 'FileManager' 
                    });
                    return;
                }
                await updateFolderData(handle);
                logger.debug('Previous folder restored', {
                    context: 'FileManager',
                    data: { name: handle.name }
                });
            } catch (err) {
                logger.error(err, { 
                    context: 'FileManager',
                    data: { action: 'restore_folder' }
                });
            }
        };
        
        restoreLastFolder();

        // Enable drag and drop
        const handleDragOver = (e: DragEvent) => e.preventDefault();
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };
        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            if (!e.relatedTarget) {
                setIsDragging(false);
            }
        };

        document.addEventListener("drop", handleDrop);
        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("dragenter", handleDragEnter);
        document.addEventListener("dragleave", handleDragLeave);

        return () => {
            document.removeEventListener("drop", handleDrop);
            document.removeEventListener("dragover", handleDragOver);
            document.removeEventListener("dragenter", handleDragEnter);
            document.removeEventListener("dragleave", handleDragLeave);
        };
    }, [runApp]);

    const deleteFile = async (index: number): Promise<boolean> => {
        if (!selectedFolder?.dirHandle) {
            console.error("Cannot delete file: directory handle is null");
            return false;
        }

        const fileToDelete = imageFiles[index];
        const confirmDelete = window.confirm(`Are you sure you want to delete:\n${fileToDelete.name}?`);
        if (!confirmDelete) return false;

        try {
            await selectedFolder.dirHandle.removeEntry(fileToDelete.name);
            const newImageFiles = [...imageFiles];
            newImageFiles.splice(index, 1);
            setImageFiles(newImageFiles);
            return true;
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file. Make sure you have permission to modify files in this folder.");
            return false;
        }
    };

    return {
        selectedFolder,
        imageFiles,
        isDragging,
        handleFolderSelect,
        handleFileSelect,
        deleteFile,
    };
}

async function FileScanner(dirHandle: FileSystemDirectoryHandle): Promise<File[]> {
    const files: File[] = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            if (file.type.startsWith("image/")) {
                files.push(file);
            }
        }
    }
    return files;
}
