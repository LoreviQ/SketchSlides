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
    size?: "sm" | "md" | "lg" | "xl"; // Using preset sizes instead
}

export function SlideshowButton({ onClick, Icon, size = "md" }: SlideshowButtonProps) {
    const sizeClasses = {
        sm: {
            p: "p-1",
            size: "size-5",
        },
        md: {
            p: "p-2",
            size: "size-6",
        },
        lg: {
            p: "p-3",
            size: "size-8",
        },
        xl: {
            p: "p-4",
            size: "size-10",
        },
    };
    return (
        <button
            className={`bg-black/50 text-white rounded-full ${sizeClasses[size]["p"]} hover:bg-gray-700`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <Icon className={`${sizeClasses[size]["size"]} text-white`} />
        </button>
    );
}
