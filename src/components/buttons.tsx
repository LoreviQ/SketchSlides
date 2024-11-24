import { SessionType, FixedTime, IntervalGroup, CustomSchedule } from "../types/session";
import {
    XMarkIcon,
    PlusIcon,
    BellSnoozeIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

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

interface ScheduleButtonProps {
    title: string;
    timeString: string;
    isDefault: boolean;
    isSelected: boolean;
    setter: () => void;
    deleter: () => void;
}
export function ScheduleButton({
    title,
    timeString,
    isDefault,
    isSelected = false,
    setter,
    deleter,
}: ScheduleButtonProps) {
    return (
        <div
            className={`w-full p-3 flex justify-between items-center text-left border rounded-lg  ${
                isSelected ? "bg-gray-800" : "bg-zinc-900 hover:bg-gray-800"
            } border-gray-700 text-white`}
            onClick={setter}
        >
            <div>
                <div>{title}</div>
                <div className="text-sm text-gray-500">{timeString}</div>
            </div>
            {!isDefault && ( // Don't allow deleting the default schedule
                <button
                    className="p-2 m-2 text-gray-500 hover:text-red-500 text-2xl rounded-full bg-transparent border-none outline-none focus:outline-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        deleter();
                    }}
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
interface IntervalGroupButtonProps {
    interval: IntervalGroup | null;
    tempSchedule: CustomSchedule;
    setTempSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
}
export function IntervalGroupButton({ interval, tempSchedule, setTempSchedule }: IntervalGroupButtonProps) {
    const newInterval = () => {
        const newInterval = new IntervalGroup(30000, 5);
        const newIntervals = [...tempSchedule.intervals, newInterval];
        setTempSchedule(new CustomSchedule(tempSchedule.title, newIntervals));
    };

    if (!interval) {
        return (
            <div
                className="grid grid-cols-2 border
             border-gray-700  text-white"
            >
                <div onClick={newInterval} className="flex justify-center p-3  hover:bg-gray-800">
                    <PlusIcon className="w-4 h-4" />
                </div>
                <div className="flex justify-center p-3  hover:bg-gray-800">
                    <BellSnoozeIcon className="w-4 h-4" />
                </div>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-8 border border-gray-700 text-white">
            <p className="p-3 text-start col-span-2">{interval.count} x</p>
            <p className="p-3 text-start col-span-3">{interval.timeString()}</p>
            <div className="flex flex-col">
                <button className="h-1/2 bg-transparent hover:bg-green-600/50 rounded-none relative">
                    <ChevronUpIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </button>
                <button className="h-1/2 bg-transparent hover:bg-green-600/50 rounded-none relative">
                    <ChevronDownIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </button>
            </div>
            <button className="bg-transparent hover:bg-yellow-400/50 rounded-none relative">
                <PencilIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
            <button className="bg-transparent hover:bg-red-600/50 rounded-none relative">
                <TrashIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
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
