import { useEffect, useState } from "react";

import type { SelectedFolder } from "../types/preferences";
import { usePreferences, preferenceUpdater } from "../contexts/PreferencesContext";
import { SessionType, FixedTime, CustomSchedule, IntervalGroup } from "../types/session";
import {
    ToggleButton,
    InputButton,
    ActionButton,
    ScheduleButton,
    IntervalGroupButton,
    NewIntervalButton,
} from "../components/buttons";
import { formatFileSize } from "../utils/formatters";
import { sessionTypeToDescription } from "../utils/session";
import { useApp } from "../contexts/AppContext";
import { DragAndDropOverlay, Hero } from "../components/style";

export default function Settings({}) {
    const { preferences } = usePreferences();
    const { selectedFolder, handleFolderSelect, handleFileSelect, isDragging, setRunApp } = useApp();

    const runApp = () => {
        if (!selectedFolder) {
            alert("Please select a folder first");
            return;
        }
        if (preferences.fixedTime === FixedTime.Other && preferences.customFixedTime === null) {
            alert("Please enter a custom fixed time");
            return;
        }
        setRunApp(true);
    };

    return (
        <>
            {isDragging && <DragAndDropOverlay />}
            <div className="w-screen flex justify-center px-6">
                <div className="w-full h-screen max-w-2xl p-6 flex flex-col">
                    <div className="flex-grow space-y-4">
                        <Hero />
                        {"showDirectoryPicker" in window ? (
                            <ActionButton onClick={handleFolderSelect} label="Select Folder" colour="bg-blue-600" />
                        ) : (
                            <ActionButton onClick={handleFileSelect} label="Select Files" colour="bg-blue-600" />
                        )}
                        <FolderDetails selectedFolder={selectedFolder} />
                        <hr className="border-gray-700" />
                        <SessionToggle />
                        <SessionTypeCard />
                        <ActionButton onClick={runApp} label="Start" colour="bg-green-700" />
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    );
}

function SessionToggle({}) {
    const { preferences, updatePreferences } = usePreferences();
    const updateSessionType = preferenceUpdater("sessionType", updatePreferences);
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Session Type</h2>
            <div className="flex gap-2">
                {Object.values(SessionType).map((type) => (
                    <ToggleButton
                        key={type}
                        label={type}
                        isSelected={preferences.sessionType === type}
                        onClick={() => updateSessionType(type)}
                    />
                ))}
            </div>
        </div>
    );
}

function FolderDetails({ selectedFolder }: { selectedFolder: SelectedFolder | null }) {
    if (!selectedFolder) {
        return (
            <div className="text-gray-400">
                <p>{`No ${"showDirectoryPicker" in window ? "folder" : "files"} selected`}</p>
                <p> Click the button, or drag and drop</p>
            </div>
        );
    }
    return (
        <div>
            <p className="text-white font-medium">{selectedFolder.name}</p>
            <p className="text-white text-sm">
                {selectedFolder.items} items • {formatFileSize(selectedFolder.totalSize)}
            </p>
        </div>
    );
}

function SessionTypeCard({}) {
    const { preferences } = usePreferences();
    let cardContent = (
        <div className="flex flex-col h-full items-center justify-center">
            <p className="text-white whitespace-pre-line text-center">
                {sessionTypeToDescription(preferences.sessionType)}
            </p>
        </div>
    );
    switch (preferences.sessionType) {
        case SessionType.Fixed:
            cardContent = <FixedCard />;
            break;
        case SessionType.Schedule:
            cardContent = <ScheduleCard />;
            break;
    }
    return <div className="overflow-y-auto space-y-4 flex flex-col min-h-24">{cardContent}</div>;
}

function FixedCard({}) {
    const { preferences, updatePreferences } = usePreferences();
    const updateFixedTime = preferenceUpdater("fixedTime", updatePreferences);
    const updateCustomFixedTime = preferenceUpdater("customFixedTime", updatePreferences);
    return (
        <>
            <h2 className="text-xl font-semibold text-white">Fixed Intervals</h2>
            <div className="flex flex-wrap gap-2">
                {Object.values(FixedTime).map((time) => {
                    if (time === FixedTime.Other) {
                        return (
                            <InputButton
                                key={time}
                                value={preferences.customFixedTime ?? ""}
                                onClick={() => updateFixedTime(FixedTime.Other)}
                                onChange={(value) => {
                                    updateFixedTime(FixedTime.Other);
                                    updateCustomFixedTime(typeof value === "number" ? value : null);
                                }}
                                placeholder="Custom (s)"
                                isSelected={preferences.fixedTime === FixedTime.Other}
                            />
                        );
                    }
                    return (
                        <ToggleButton
                            key={time}
                            label={time}
                            isSelected={preferences.fixedTime === time}
                            onClick={() => updateFixedTime(time)}
                        />
                    );
                })}
            </div>
        </>
    );
}

function ScheduleCard({}) {
    const { preferences, updatePreferences } = usePreferences();
    const updateSchedules = preferenceUpdater("schedules", updatePreferences);
    const schedules = preferences.schedules.map((schedule) => CustomSchedule.fromObject(schedule));
    const { selectedSchedule, setSelectedSchedule } = useApp();
    const [showDetails, setShowDetails] = useState(false);
    const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 768);
    useEffect(() => {
        setSelectedSchedule(schedules[0]);
        checkWidth();
        const handleResize = () => checkWidth();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const checkWidth = () => {
        setIsNarrowScreen(window.innerWidth < 768);
    };
    if (isNarrowScreen) {
        return (
            <ScheduleCardNarrow
                schedules={schedules}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
                showDetails={showDetails}
                setShowDetails={setShowDetails}
                updateSchedules={updateSchedules}
            />
        );
    }
    return (
        <ScheduleCardWide
            schedules={schedules}
            selectedSchedule={selectedSchedule}
            setSelectedSchedule={setSelectedSchedule}
            updateSchedules={updateSchedules}
        />
    );
}
interface ScheduleCardNarrowProps {
    schedules: CustomSchedule[];
    selectedSchedule: CustomSchedule;
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    showDetails: boolean;
    setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
    updateSchedules: (value: CustomSchedule[]) => void;
}
function ScheduleCardNarrow({
    schedules,
    selectedSchedule,
    setSelectedSchedule,
    showDetails,
    setShowDetails,
    updateSchedules,
}: ScheduleCardNarrowProps) {
    return (
        <div className="w-full">
            {!showDetails ? (
                <ScheduleSelector
                    schedules={schedules}
                    selectedSchedule={selectedSchedule}
                    setSelectedSchedule={setSelectedSchedule}
                    updateSchedules={updateSchedules}
                    onEdit={() => setShowDetails(true)}
                    narrowMode={true}
                />
            ) : (
                <ScheduleDetails
                    schedules={schedules}
                    selectedSchedule={selectedSchedule}
                    updateSchedules={updateSchedules}
                    onSave={() => setShowDetails(false)}
                />
            )}
        </div>
    );
}
interface ScheduleCardWideProps {
    schedules: CustomSchedule[];
    selectedSchedule: CustomSchedule;
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    updateSchedules: (value: CustomSchedule[]) => void;
}
function ScheduleCardWide({
    schedules,
    selectedSchedule,
    setSelectedSchedule,
    updateSchedules,
}: ScheduleCardWideProps) {
    return (
        <div className="w-full grid grid-cols-2 gap-4">
            <ScheduleSelector
                schedules={schedules}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
                updateSchedules={updateSchedules}
            />
            <ScheduleDetails
                schedules={schedules}
                selectedSchedule={selectedSchedule}
                updateSchedules={updateSchedules}
            />
        </div>
    );
}

interface ScheduleSelectorProps {
    schedules: CustomSchedule[];
    selectedSchedule: CustomSchedule;
    setSelectedSchedule: React.Dispatch<React.SetStateAction<CustomSchedule>>;
    updateSchedules: (value: CustomSchedule[]) => void;
    onEdit?: () => void;
    narrowMode?: boolean;
}
function ScheduleSelector({
    schedules,
    selectedSchedule,
    setSelectedSchedule,
    updateSchedules,
    onEdit = () => {},
    narrowMode = false,
}: ScheduleSelectorProps) {
    const addNewSchedule = () => {
        const newSchedule = new CustomSchedule("Custom Schedule " + schedules.length, [new IntervalGroup(30000, 5)]);
        const updatedSchedules = [...schedules, newSchedule];
        updateSchedules(updatedSchedules);
        setSelectedSchedule(newSchedule);
    };
    const deleteSchedule = (index: number) => {
        const scheduleToDelete = schedules[index];
        const updatedSchedules = schedules.filter((_, i) => i !== index);
        updateSchedules(updatedSchedules);
        // if deleted schedule is selected, select the default schedule
        if (selectedSchedule.equals(scheduleToDelete)) {
            setSelectedSchedule(schedules[0]);
        }
    };
    return (
        <div
            className={`space-y-4
            ${narrowMode ? "" : "pr-4 border-r border-gray-700"}
        `}
        >
            <h2 className="text-xl font-semibold text-white">Scheduled Intervals</h2>
            <div className="space-y-2">
                {schedules.map((schedule, index) => (
                    <ScheduleButton
                        key={index}
                        schedule={schedule}
                        isSelected={selectedSchedule.equals(schedule)}
                        narrowMode={narrowMode}
                        setter={() => setSelectedSchedule(schedule)}
                        deleter={() => deleteSchedule(index)}
                        editer={() => onEdit()}
                    />
                ))}
                <div
                    className="w-full p-3 text-center border rounded-lg bg-zinc-900
                    hover:bg-gray-800 border-gray-700 text-white"
                    onClick={addNewSchedule}
                >
                    + Create New Schedule
                </div>
            </div>
        </div>
    );
}

interface ScheduleDetailsProps {
    schedules: CustomSchedule[];
    selectedSchedule: CustomSchedule;
    updateSchedules: (value: CustomSchedule[]) => void;
    onSave?: () => void;
}
function ScheduleDetails({ schedules, selectedSchedule, updateSchedules, onSave }: ScheduleDetailsProps) {
    const [tempSchedule, setTempSchedule] = useState(selectedSchedule);
    const intervals = tempSchedule.intervals.map((interval) => IntervalGroup.fromObject(interval));

    const saveNewSchedule = () => {
        schedules[schedules.findIndex((s) => s.equals(selectedSchedule))] = tempSchedule;
        updateSchedules(schedules);
    };
    useEffect(() => {
        setTempSchedule(selectedSchedule);
    }, [selectedSchedule]);
    return (
        <div className={`space-y-4`}>
            <div className="flex justify-center">
                <input
                    value={tempSchedule.title}
                    onChange={(e) => setTempSchedule(new CustomSchedule(e.target.value, intervals))}
                    disabled={tempSchedule.isDefault}
                    className="text-xl font-medium text-white bg-transparent border-none outline-none focus:outline-none text-center"
                />
            </div>
            <div className="">
                {intervals.map((interval, index) => (
                    <IntervalGroupButton
                        key={index}
                        interval={interval}
                        index={index}
                        tempSchedule={tempSchedule}
                        setTempSchedule={setTempSchedule}
                    />
                ))}
                {!tempSchedule.isDefault && (
                    <NewIntervalButton tempSchedule={tempSchedule} setTempSchedule={setTempSchedule} />
                )}
            </div>
            <div className="text-sm text-white">Total time: {tempSchedule.totalTimeString}</div>
            {!tempSchedule.isDefault && (
                <ActionButton
                    onClick={() => {
                        saveNewSchedule();
                        onSave?.();
                    }}
                    label="Save Changes"
                    colour="bg-green-700"
                />
            )}
        </div>
    );
}

function Footer() {
    const version = import.meta.env.VITE_GIT_SHA || "X";
    return (
        <div className="flex justify-between text-sm text-white items-center text-center">
            <div>
                Contact:{" "}
                <a href="mailto:oliver.tj@oliver.tj" className="hover:underline">
                    oliver.tj@oliver.tj
                </a>
            </div>
            <div>
                <a href="https://ko-fi.com/O4O61AQHEB" target="_blank" rel="noopener noreferrer">
                    <img 
                        src="/images/support_me_on_kofi_dark.webp"
                        alt="Support me on Ko-fi" 
                        width="178"
                        height="36"
                        loading="lazy"
                        className="h-9"
                    />
                </a>
            </div>
            <div>Version 1.0.{version}</div>
        </div>
    );
}
