import { useRef, useCallback } from 'react';
import { Sound } from '../types';

// Helper to decode Base64
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64.split(',')[1]); // remove data:mime/type;base64, prefix
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- 8-Bit Music Definitions ---
const NOTE_FREQUENCIES: Record<string, number> = {
  'F#4': 369.99, 'G#4': 415.30, 'A4': 440.00, 'B4': 493.88,
  'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00,
};
type Note = { note: keyof typeof NOTE_FREQUENCIES | null; duration: number };

const RALLY_X_MELODY: Note[] = [
  { note: 'G5', duration: 0.07 }, { note: null, duration: 0.01 }, { note: 'G5', duration: 0.07 }, { note: null, duration: 0.01 }, { note: 'G5', duration: 0.07 }, { note: null, duration: 0.01 }, { note: 'D#5', duration: 0.08 },
  { note: 'G5', duration: 0.12 }, { note: 'F5', duration: 0.12 }, { note: 'E5', duration: 0.12 }, { note: 'D#5', duration: 0.12 },
  { note: 'D5', duration: 0.15 }, { note: null, duration: 0.05 }, { note: 'D5', duration: 0.15 }, { note: null, duration: 0.05 }, { note: 'D#5', duration: 0.15 }, { note: null, duration: 0.05 }, { note: 'E5', duration: 0.15 },
];
const MOON_PATROL_MELODY: Note[] = [
    { note: 'F#4', duration: 0.15 }, { note: 'B4', duration: 0.15 }, { note: 'C#5', duration: 0.15 }, { note: 'D#5', duration: 0.15 },
    { note: 'C#5', duration: 0.15 }, { note: 'B4', duration: 0.15 }, { note: 'F#4', duration: 0.15 }, { note: 'B4', duration: 0.15 },
    { note: 'C#5', duration: 0.15 }, { note: 'D#5', duration: 0.15 }, { note: 'C#5', duration: 0.15 }, { note: 'B4', duration: 0.15 },
];
const ELEVATOR_ACTION_MELODY: Note[] = [
    { note: 'C#5', duration: 0.15 }, { note: 'D#5', duration: 0.15 }, { note: 'E5', duration: 0.3 },
    { note: 'C#5', duration: 0.2 }, { note: 'A4', duration: 0.2 }, { note: 'B4', duration: 0.4 },
    { note: null, duration: 0.2 },
    { note: 'A4', duration: 0.15 }, { note: 'B4', duration: 0.15 }, { note: 'C#5', duration: 0.3 },
    { note: 'A4', duration: 0.2 }, { note: 'F#4', duration: 0.2 }, { note: 'G#4', duration: 0.4 },
];
// --- End Music Definitions ---

export function useAlarm() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioNode | null>(null); // Can be Oscillator or BufferSource
  const loopTimerRef = useRef<number | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const resumeContext = useCallback(() => {
    const context = getAudioContext();
    if (context.state === 'suspended') {
      context.resume();
    }
  }, [getAudioContext]);

  const stop = useCallback(() => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    if (sourceRef.current) {
        if (typeof (sourceRef.current as any).stop === 'function') {
            (sourceRef.current as any).stop();
        }
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
  }, []);

  const play = useCallback(async (sound: Sound, customSoundData: string | null, isContinuous: boolean) => {
    stop(); 
    const context = getAudioContext();

    if (sound === Sound.CUSTOM && customSoundData) {
        try {
            const audioBuffer = await context.decodeAudioData(base64ToArrayBuffer(customSoundData));
            const bufferSource = context.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.loop = isContinuous;
            bufferSource.connect(context.destination);
            bufferSource.start();
            sourceRef.current = bufferSource;
        } catch (error) {
            console.error("Error decoding custom audio data:", error);
            // Fallback to default retro sound if custom fails
            await play(Sound.RALLY_X, null, isContinuous);
        }
        return;
    }

    let melody: Note[];
    switch (sound) {
        case Sound.RALLY_X:
            melody = RALLY_X_MELODY;
            break;
        case Sound.MOON_PATROL:
            melody = MOON_PATROL_MELODY;
            break;
        case Sound.ELEVATOR_ACTION:
            melody = ELEVATOR_ACTION_MELODY;
            break;
        default: // Fallback to a simple sound
            melody = [{ note: 'A5', duration: 1 }];
            break;
    }

    const playMelody = () => {
        let scheduleTime = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = 'square'; // Authentic 8-bit sound
        oscillator.connect(gain);
        gain.connect(context.destination);
        gain.gain.setValueAtTime(0, scheduleTime);

        melody.forEach(noteInfo => {
            if (noteInfo.note && NOTE_FREQUENCIES[noteInfo.note]) {
                gain.gain.setValueAtTime(0.2, scheduleTime); // Note start volume
                oscillator.frequency.setValueAtTime(NOTE_FREQUENCIES[noteInfo.note], scheduleTime);
                // Create a staccato effect by silencing the note just before the next one starts
                gain.gain.setValueAtTime(0, scheduleTime + noteInfo.duration * 0.9);
            }
            scheduleTime += noteInfo.duration;
        });

        sourceRef.current = oscillator;
        oscillator.start(context.currentTime);
        oscillator.stop(scheduleTime);

        const totalDuration = scheduleTime - context.currentTime;

        if (isContinuous) {
            loopTimerRef.current = window.setTimeout(playMelody, totalDuration * 1000 + 300); // Loop with a pause
        }
    };

    playMelody();
  }, [getAudioContext, stop]);

  return { play, stop, resumeContext };
}