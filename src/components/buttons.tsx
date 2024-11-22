import { SessionType, FixedTime } from "./../types/session";
import ExitIcon from "../assets/exit.svg";

interface ToggleButtonProps<T extends SessionType | FixedTime> {
    label: T;
    isSelected: boolean;
    setter: (value: T) => void;
    fullWidth?: boolean;
}
export function ToggleButton<T extends SessionType | FixedTime>({
    label,
    isSelected,
    setter,
    fullWidth = true,
}: ToggleButtonProps<T>) {
    return (
        <button
            className={`${fullWidth ? "flex-1" : ""} py-2 px-4 rounded-lg transition ${
                isSelected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setter(label)}
        >
            {label}
        </button>
    );
}

interface SlideshowButtonnProps {
    setter: (value: boolean) => void;
}
export function SlideshowButton({ setter }: SlideshowButtonnProps) {
    return (
        <button
            className="absolute top-4 left-4 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
            onClick={() => setter(false)}
        >
            <ExitIcon className="w-6 h-6" />
        </button>
    );
}
