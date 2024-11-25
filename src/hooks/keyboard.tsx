import { useEffect } from "react";

interface KeyboardControls {
    onNext?: () => void;
    onPrev?: () => void;
    onPause?: () => void;
    onExit?: () => void;
}
export const useKeyboardControls = (controls: KeyboardControls) => {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowRight":
                    controls.onNext?.();
                    break;
                case "ArrowLeft":
                    controls.onPrev?.();
                    break;
                case " ":
                    controls.onPause?.();
                    break;
                case "Escape":
                    controls.onExit?.();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [controls]);
};
