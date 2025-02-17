import { useEffect, useState } from "react";

import {
    XMarkIcon,
    PlusIcon,
    BellSnoozeIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";

import { SessionType, FixedTime, IntervalGroup, CustomSchedule } from "../types/session";

interface ActionButtonProps {
    onClick: () => void;
    label: string;
    colour: string;
}
export function ActionButton({ onClick, label, colour }: ActionButtonProps) {
    return (
        <button
            className={`w-full py-2 px-4 ${colour} text-white rounded-lg hover:bg-${colour}-700 transition`}
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
                isSelected ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
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
                isSelected ? "bg-blue-600" : "bg-gray-700 text-white"
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
                    isSelected ? "bg-blue-600 " : "bg-gray-700 text-white"
                } outline-none text-right`}
            />
            {value !== "" && <span className="absolute right-6 pointer-events-none">s</span>}
        </div>
    );
}

interface ScheduleButtonProps {
    schedule: CustomSchedule;
    isSelected: boolean;
    narrowMode?: boolean;
    setter: () => void;
    deleter: () => void;
    editer?: () => void;
}
export function ScheduleButton({
    schedule,
    isSelected = false,
    narrowMode,
    setter,
    deleter,
    editer,
}: ScheduleButtonProps) {
    return (
        <div
            className={`w-full p-3 flex justify-between items-center text-left border rounded-lg  ${
                isSelected ? "bg-gray-800" : "bg-zinc-900 hover:bg-gray-800"
            } border-gray-700 text-white`}
            onClick={setter}
        >
            <div>
                <div>{schedule.title}</div>
                <div className="text-sm text-gray-500">{schedule.totalTimeString}</div>
            </div>
            {!schedule.isDefault && ( // Don't allow deleting the default schedule
                <div>
                    {narrowMode && (
                        <button
                            className="p-2 m-2 text-gray-500 hover:text-yellow-500 text-2xl rounded-full bg-transparent border-none outline-none focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                setter();
                                editer?.();
                            }}
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        className="p-2 m-2 text-gray-500 hover:text-red-500 text-2xl rounded-full bg-transparent border-none outline-none focus:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleter();
                        }}
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
interface IntervalGroupButtonProps {
    interval: IntervalGroup;
    index: number;
    tempSchedule: CustomSchedule;
    setTempSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
}
export function IntervalGroupButton({ interval, index, tempSchedule, setTempSchedule }: IntervalGroupButtonProps) {
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        setIsEditing(false);
    }, [tempSchedule]);

    if (isEditing) {
        return (
            <IntervalButtonEditableContent
                interval={interval}
                index={index}
                tempSchedule={tempSchedule}
                setTempSchedule={setTempSchedule}
                setIsEditing={setIsEditing}
            />
        );
    }
    return (
        <IntervalButtonContent
            interval={interval}
            index={index}
            tempSchedule={tempSchedule}
            setTempSchedule={setTempSchedule}
            setIsEditing={setIsEditing}
        />
    );
}

interface IntervalButtonContentProps {
    interval: IntervalGroup;
    index: number;
    tempSchedule: CustomSchedule;
    setTempSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}
function IntervalButtonContent({
    interval,
    index,
    tempSchedule,
    setTempSchedule,
    setIsEditing,
}: IntervalButtonContentProps) {
    const moveInterval = (direction: "up" | "down") => {
        if (
            (index === 0 && direction === "up") ||
            (index === tempSchedule.intervals.length - 1 && direction === "down")
        ) {
            return;
        }
        const increment = direction === "up" ? -1 : 1;
        const newIntervals = [...tempSchedule.intervals];
        const temp = newIntervals[index + increment];
        newIntervals[index + increment] = newIntervals[index];
        newIntervals[index] = temp;
        setTempSchedule(new CustomSchedule(tempSchedule.title, newIntervals));
    };
    const deleteInterval = () => {
        const newIntervals = tempSchedule.intervals.filter((_, i) => i !== index);
        setTempSchedule(new CustomSchedule(tempSchedule.title, newIntervals));
    };
    return (
        <div className="grid grid-cols-7 border border-gray-700 text-white">
            <p className="p-3 text-start col-span-1">{interval.count}</p>
            <p className="p-3 text-start col-span-1">x</p>
            <p className="p-3 text-start col-span-2">{interval.timeString()}</p>
            {!tempSchedule.isDefault && (
                <>
                    <div className="flex flex-col">
                        <button
                            className="h-1/2 bg-transparent hover:bg-green-600/50 rounded-none relative"
                            onClick={() => moveInterval("up")}
                        >
                            <ChevronUpIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </button>
                        <button
                            className="h-1/2 bg-transparent hover:bg-green-600/50 rounded-none relative"
                            onClick={() => moveInterval("down")}
                        >
                            <ChevronDownIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </button>
                    </div>
                    <button
                        className="bg-transparent hover:bg-yellow-400/50 rounded-none relative"
                        onClick={() => setIsEditing(true)}
                    >
                        <PencilIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </button>
                    <button
                        className="bg-transparent hover:bg-red-600/50 rounded-none relative"
                        onClick={deleteInterval}
                    >
                        <TrashIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </button>
                </>
            )}
        </div>
    );
}

interface IntervalButtonEditableContentProps {
    interval: IntervalGroup;
    index: number;
    tempSchedule: CustomSchedule;
    setTempSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}
function IntervalButtonEditableContent({
    interval,
    index,
    tempSchedule,
    setTempSchedule,
    setIsEditing,
}: IntervalButtonEditableContentProps) {
    const [tempInterval, setTempInterval] = useState(interval);
    const updateInterval = () => {
        const newIntervals = [...tempSchedule.intervals];
        newIntervals[index!] = tempInterval;
        setTempSchedule(new CustomSchedule(tempSchedule.title, newIntervals));
        setIsEditing(false);
    };
    return (
        <div className="grid grid-cols-7 border border-gray-700 text-white">
            <input
                type="number"
                value={tempInterval.count}
                onChange={(e) => setTempInterval(new IntervalGroup(tempInterval.interval, Number(e.target.value)))}
                className="p-3 text-start col-span-2 bg-transparent"
                placeholder={tempInterval.count.toString()}
            />
            <p className="p-3 text-start col-span-1">x</p>
            <input
                type="number"
                value={tempInterval.interval / 1000}
                onChange={(e) => setTempInterval(new IntervalGroup(Number(e.target.value) * 1000, tempInterval.count))}
                className="p-3 text-start col-span-2 bg-transparent"
                placeholder={(tempInterval.interval / 1000).toString()}
            />
            <button
                className="bg-transparent col-span-2 hover:bg-green-600/50 rounded-none relative"
                onClick={updateInterval}
            >
                <CheckIcon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
        </div>
    );
}

interface NewIntervalButtonProps {
    tempSchedule: CustomSchedule;
    setTempSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
}
export function NewIntervalButton({ tempSchedule, setTempSchedule }: NewIntervalButtonProps) {
    const newInterval = () => {
        const newInterval = new IntervalGroup(30000, 5);
        const newIntervals = [...tempSchedule.intervals, newInterval];
        setTempSchedule(new CustomSchedule(tempSchedule.title, newIntervals));
    };
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

interface SlideshowButtonProps {
    onClick: () => void;
    Icon: React.ComponentType<{ className?: string }>;
    size?: "sm" | "md" | "lg" | "xl"; // Using preset sizes instead
    showBg?: boolean;
}
export function SlideshowButton({ onClick, Icon, size = "md", showBg = false }: SlideshowButtonProps) {
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
            className={`${showBg ? "bg-black/50" : "bg-transparent"} text-white rounded-full ${
                sizeClasses[size]["p"]
            } hover:bg-gray-700 border-none outline-none`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <Icon className={`${sizeClasses[size]["size"]} text-white`} />
        </button>
    );
}
