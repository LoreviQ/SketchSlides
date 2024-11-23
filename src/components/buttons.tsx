import { SessionType, FixedTime } from "../types/session";

interface ActionButtonProps {
    onClick: () => void;
    label: string;
    colour: "blue" | "green";
}
export function ActionButton({ onClick, label, colour }: ActionButtonProps) {
    return (
        <button
            className={`w-full py-2 px-4 bg-${colour}-600 text-white rounded-lg hover:bg-${colour}-700 transition`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

interface ToggleButtonProps<T extends SessionType | FixedTime> {
    onClick: () => void;
    label: T;
    isSelected: boolean;
    fullWidth?: boolean;
}
export function ToggleButton<T extends SessionType | FixedTime>({
    onClick,
    label,
    isSelected,
    fullWidth = true,
}: ToggleButtonProps<T>) {
    return (
        <button
            className={`${fullWidth ? "flex-1" : ""} py-2 px-4 rounded-lg transition ${
                isSelected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

interface InputButtonProps {
    value: number | "";
    onClick: () => void;
    onChange: (value: number | "") => void;
    placeholder?: string;
    fullWidth?: boolean;
    isSelected?: boolean;
}

export function InputButton({
    value,
    onClick,
    onChange,
    placeholder,
    fullWidth = true,
    isSelected = false,
}: InputButtonProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (newValue === "") {
            onChange("");
        } else if (/^\d+$/.test(newValue)) {
            onChange(parseInt(newValue));
        }
    };

    return (
        <div
            className={`${fullWidth ? "flex-1" : ""} relative py-2 rounded-lg text-white inline-block ${
                isSelected ? "bg-blue-600 " : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
        >
            <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={value}
                onClick={onClick}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-32 pe-8  text-white ${
                    isSelected ? "bg-blue-600 " : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                } outline-none text-right`}
            />
            {value !== "" && <span className="absolute right-6 pointer-events-none">s</span>}
        </div>
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
