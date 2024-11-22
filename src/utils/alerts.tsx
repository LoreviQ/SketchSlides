import * as Tone from "tone";

export const timerAlerts = {
    threeSec: () =>
        playAlert({
            frequency: 330,
            duration: 0.3,
            type: "sine",
            volume: 0.5,
        }),
    twoSec: () =>
        playAlert({
            frequency: 440,
            duration: 0.3,
            type: "sine",
            volume: 0.5,
        }),
    oneSec: () =>
        playAlert({
            frequency: 550,
            duration: 0.3,
            type: "sine",
            volume: 0.5,
        }),
};

interface AlertOptions {
    frequency?: number; // Base frequency in Hz
    duration?: number; // Duration in seconds
    volume?: number; // Volume from 0 to 1
    type?: "sine" | "square" | "triangle" | "sawtooth"; // Waveform type
    envelope?: {
        // Sound envelope
        attack: number; // Time to reach full volume
        decay: number; // Time to reach sustain level
        sustain: number; // Level to sustain at
        release: number; // Time to fade out
    };
}

export function playAlert({
    frequency = 440,
    duration = 0.3,
    volume = 0.5,
    type = "sine",
    envelope = {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.1,
    },
}: AlertOptions = {}) {
    const synth = new Tone.Synth({
        oscillator: {
            type: type,
        },
        envelope: envelope,
        volume: Tone.gainToDb(volume), // Convert linear gain to decibels
    }).toDestination();

    synth.triggerAttackRelease(frequency, duration);
}
