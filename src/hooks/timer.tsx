import { useState, useEffect } from "react";
import { timerAlerts } from "../utils/alerts";
import { useToggle } from "./misc";
import { SessionType, FixedTime } from "../types/session";
import { fixedTimeToMS } from "../utils/session";

export const INTERVAL_MS = 50;

interface TimerConfig {
    currentImageUrl: string;
    sessionType: SessionType;
    fixedTime: FixedTime;
    isMuted: boolean;
    sessionIntervals: number[];
    currentIntervalIndex: number;
    onComplete: () => void;
}

interface TimerState {
    counter: number;
    ticksPerSlide: number;
    isPaused: boolean;
    togglePause: () => void;
}

export const useTimer = ({
    currentImageUrl,
    sessionType,
    fixedTime,
    isMuted,
    sessionIntervals,
    currentIntervalIndex,
    onComplete,
}: TimerConfig): TimerState => {
    const getCurrentInterval = () => {
        if (sessionType === SessionType.Schedule) {
            return sessionIntervals[currentIntervalIndex];
        }
        return fixedTimeToMS(fixedTime);
    };

    const timeMS = getCurrentInterval();
    const [counter, setCounter] = useState(0);
    const [isPaused, togglePause] = useToggle(false);
    const ticksPerSlide = timeMS / INTERVAL_MS;

    // Timer
    useEffect(() => {
        if (isPaused || sessionType === SessionType.Relaxed) {
            return;
        }
        let timer: number | null = null;
        timer = window.setInterval(() => {
            setCounter((prev) => {
                const next = prev + 1;
                if (next >= ticksPerSlide) {
                    onComplete();
                    return 0;
                }
                return next;
            });
        }, INTERVAL_MS);

        return () => clearInterval(timer);
    }, [isPaused, isMuted, onComplete]);

    // Sound alerts
    useEffect(() => {
        const remainingSeconds = ((ticksPerSlide - counter) * INTERVAL_MS) / 1000;
        if (!isMuted) {
            if (remainingSeconds <= 3.01 && remainingSeconds > 2.99) {
                timerAlerts.threeSec();
            } else if (remainingSeconds <= 2.01 && remainingSeconds > 1.99) {
                timerAlerts.twoSec();
            } else if (remainingSeconds <= 1.01 && remainingSeconds > 0.99) {
                timerAlerts.oneSec();
            }
        }
    }, [counter, isMuted]);

    // Reset the timer when the image changes
    useEffect(() => {
        setCounter(0);
    }, [currentImageUrl]);

    return {
        counter,
        ticksPerSlide,
        isPaused,
        togglePause,
    };
};
