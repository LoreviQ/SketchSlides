import { SessionType, FixedTime } from "../types/session";

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

interface SlideshowButtonProps {
    onClick: () => void;
    Icon: React.ComponentType<{ className?: string }>;
}

export function SlideshowButton({ onClick, Icon }: SlideshowButtonProps) {
    return (
        <button
            className="bg-black/50 text-white rounded-full p-2 hover:bg-gray-700"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <Icon className="size-6 text-white" />
        </button>
    );
}
