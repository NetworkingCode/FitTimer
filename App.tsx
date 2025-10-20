import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Theme, AlarmMode } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAlarm } from './hooks/useAlarm';
import { DEFAULT_SETTINGS, FONT_CLASSES, THEME_CLASSES, TRANSLATIONS } from './constants';
import { SettingsModal } from './components/SettingsModal';
import { TimerDisplay } from './components/TimerDisplay';
import { ArcadeAnimation } from './components/ArcadeAnimation';

// Define a type for the settings that will be persisted to localStorage.
// Exclude `customSoundData` to avoid exceeding storage quota.
type PersistedSettings = Omit<Settings, 'customSoundData'>;

// Create a default value for persisted settings by removing `customSoundData`.
const { customSoundData: _, ...defaultPersistedSettings } = DEFAULT_SETTINGS;


const App: React.FC = () => {
  const [persistedSettings, setPersistedSettings] = useLocalStorage<PersistedSettings>('fit_timer_settings', defaultPersistedSettings);
  const [customSoundData, setCustomSoundData] = useState<string | null>(null);

  // Combine persisted settings with in-memory state for the complete settings object.
  const settings: Settings = {
    ...persistedSettings,
    customSoundData,
  };
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTime, setEditedTime] = useState({ minutes: settings.minutes, seconds: settings.seconds });
  const [timeRemaining, setTimeRemaining] = useState(settings.minutes * 60 + settings.seconds);

  const timerIntervalRef = useRef<number | null>(null);
  const { play, stop: stopAlarm, resumeContext } = useAlarm();
  const T = TRANSLATIONS[settings.language];

  // Sync timeRemaining with settings when not running or editing
  useEffect(() => {
    if (!isTimerRunning && !isAlarmPlaying && !isEditingTime) {
        setTimeRemaining(settings.minutes * 60 + settings.seconds);
    }
  }, [settings.minutes, settings.seconds, isTimerRunning, isAlarmPlaying, isEditingTime]);
  
  // Main timer logic
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeRemaining === 0) {
      setIsTimerRunning(false);
      setIsAlarmPlaying(true);
      play(settings.sound, settings.customSoundData, settings.alarmMode === AlarmMode.CONTINUOUS);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, play, settings.sound, settings.customSoundData, settings.alarmMode]);
  
  // Set viewport height CSS variable for mobile keyboard support
  useEffect(() => {
    const setVh = () => {
      const vh = (window.visualViewport?.height || window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const visualViewport = window.visualViewport;

    if (visualViewport) {
      visualViewport.addEventListener('resize', setVh);
    } else {
      window.addEventListener('resize', setVh);
    }
    
    setVh(); // Set initial value

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener('resize', setVh);
      } else {
        window.removeEventListener('resize', setVh);
      }
    };
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<Settings>) => {
    // Separate customSoundData from other settings.
    const { customSoundData: newSoundData, ...otherSettings } = newSettings;

    // If customSoundData is present in the update, handle it in the non-persistent state.
    // `undefined` check is crucial because `null` is a valid value (to clear the sound).
    if (newSoundData !== undefined) {
      setCustomSoundData(newSoundData);
    }
    
    // If there are other settings, update the persisted state.
    if (Object.keys(otherSettings).length > 0) {
      setPersistedSettings(prev => {
        // Create a clean copy of the previous state to ensure any old, non-compliant
        // `customSoundData` properties are stripped before saving.
        const cleanedPrev = { ...prev };
        delete (cleanedPrev as Partial<Settings>).customSoundData;

        return { ...cleanedPrev, ...otherSettings };
      });
    }
  }, [setPersistedSettings]);

  const handleStart = () => {
    resumeContext();
    const totalSeconds = settings.minutes * 60 + settings.seconds;
    if (totalSeconds > 0) {
      setTimeRemaining(totalSeconds);
      setIsTimerRunning(true);
      setIsSettingsOpen(false);
    }
  };

  const handleStop = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimeRemaining(settings.minutes * 60 + settings.seconds);
  };

  const handleAlarmStop = () => {
    stopAlarm();
    setIsAlarmPlaying(false);
  };
  
  const handleStartEditing = () => {
    if (isTimerRunning) return;
    setEditedTime({ minutes: settings.minutes, seconds: settings.seconds });
    setIsEditingTime(true);
  };

  const handleSaveTime = () => {
    handleSettingsChange({ minutes: editedTime.minutes, seconds: editedTime.seconds });
    setIsEditingTime(false);
  };

  const handleCancelEditing = () => {
      setIsEditingTime(false);
  };
  
  const handleEditedMinutesChange = (newMinutes: number) => {
      setEditedTime(t => ({ ...t, minutes: Math.max(0, Math.min(99, newMinutes)) }));
  };

  const handleEditedSecondsChange = (newSeconds: number) => {
      setEditedTime(t => ({ ...t, seconds: Math.max(0, Math.min(59, newSeconds)) }));
  };

  const themeClass = settings.theme === Theme.CUSTOM ? '' : THEME_CLASSES[settings.theme].bg;
  const textClass = isEditingTime ? THEME_CLASSES[Theme.LIGHT].text : (settings.theme === Theme.DARK ? THEME_CLASSES[Theme.DARK].text : THEME_CLASSES[Theme.LIGHT].text);
  const timerTextClass = isTimerRunning ? 'text-white' : '';
  
  const getDynamicStyle = () => {
    if (settings.theme === Theme.CUSTOM && !isEditingTime) {
        return { backgroundColor: settings.customColor };
    }
     if(isEditingTime) {
      return { backgroundColor: '#f3f4f6' }; // Light gray for editing background
    }
    return {};
  }

  const displayMinutes = Math.floor(timeRemaining / 60);
  const displaySeconds = timeRemaining % 60;
  
  const minutesToShow = isEditingTime ? editedTime.minutes : displayMinutes;
  const secondsToShow = isEditingTime ? editedTime.seconds : displaySeconds;

  return (
    <main
      style={getDynamicStyle()}
      className={`relative h-full w-full flex flex-col items-center justify-center transition-colors duration-500 p-8 overflow-hidden ${FONT_CLASSES[settings.font]} ${isEditingTime ? '' : themeClass} ${textClass}`}
    >
        {isTimerRunning && <ArcadeAnimation isActive={isTimerRunning} />}

        <div 
          className={`flex-grow flex items-center justify-center relative z-10 w-full ${!isTimerRunning && !isEditingTime ? 'cursor-pointer' : ''}`}
          onClick={!isTimerRunning && !isEditingTime ? handleStartEditing : undefined}
        >
             <TimerDisplay
                minutes={minutesToShow}
                seconds={secondsToShow}
                className={timerTextClass}
                isEditing={isEditingTime}
                onMinutesChange={handleEditedMinutesChange}
                onSecondsChange={handleEditedSecondsChange}
            />
        </div>

        <div className="w-full max-w-xs flex-shrink-0 relative z-10 flex flex-col items-center space-y-4">
            {isEditingTime ? (
              <>
                <button
                  onClick={handleSaveTime}
                  className="w-full py-4 text-2xl font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-300 shadow-lg transform hover:scale-105"
                >
                  {T.save}
                </button>
                <button
                  onClick={handleCancelEditing}
                  className="w-full py-3 text-lg font-semibold rounded-full transition-all duration-300 shadow-md transform hover:scale-105 bg-gray-500/20 hover:bg-gray-500/30 text-current"
                >
                  {T.cancel}
                </button>
              </>
            ) : (
              <>
                <button
                    onClick={isTimerRunning ? handleStop : handleStart}
                    className={`w-full py-4 text-2xl font-bold text-white rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                    {isTimerRunning ? T.stop : T.start}
                </button>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`w-full py-3 text-lg font-semibold rounded-full transition-all duration-300 shadow-md transform hover:scale-105 ${
                        isTimerRunning 
                        ? 'opacity-0 pointer-events-none' 
                        : 'bg-white/20 hover:bg-white/30 text-current'
                    }`}
                    aria-label={T.settingsTitle}
                    disabled={isTimerRunning}
                >
                    {T.settingsTitle}
                </button>
              </>
            )}
        </div>

      {isSettingsOpen && (
        <SettingsModal 
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isAlarmPlaying && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer animate-pulse"
          onClick={handleAlarmStop}
        >
          <p className="text-white text-3xl font-bold text-center p-4">{T.tapToStop}</p>
        </div>
      )}
    </main>
  );
};

export default App;