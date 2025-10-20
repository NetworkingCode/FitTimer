import React, { useState, useEffect, useRef } from 'react';
import { Settings, Language, AppFont, Sound, Theme, AlarmMode } from '../types';
import { TRANSLATIONS, FONT_NAMES } from '../constants';
import { CheckIcon } from './icons/CheckIcon';
import { useAlarm } from '../hooks/useAlarm';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface SettingsModalProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSettingsChange, onClose }) => {
  const T = TRANSLATIONS[settings.language];
  const { play, stop, resumeContext } = useAlarm();
  const [playingPreview, setPlayingPreview] = useState<Sound | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the modal closes, stop any preview sound.
    return () => stop();
  }, [stop]);

  const handlePreview = async (e: React.MouseEvent, soundToPreview: Sound) => {
    e.stopPropagation(); // Prevent the option from being selected
    resumeContext();

    if (playingPreview === soundToPreview) {
      stop();
      setPlayingPreview(null);
      return;
    }
    
    stop(); // Stop any currently playing sound

    const soundData = soundToPreview === Sound.CUSTOM ? settings.customSoundData : null;
    if (soundToPreview === Sound.CUSTOM && !soundData) {
      setPlayingPreview(null);
      return; // Do not play if custom sound is selected but not uploaded
    }
    
    setPlayingPreview(soundToPreview);
    await play(soundToPreview, soundData, false);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    stop();
    setPlayingPreview(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        onSettingsChange({ customSoundData: base64Data, sound: Sound.CUSTOM });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const soundOptions = [
    { id: Sound.RALLY_X, label: T.rallyX },
    { id: Sound.MOON_PATROL, label: T.moonPatrol },
    { id: Sound.ELEVATOR_ACTION, label: T.elevatorAction },
  ];

  const renderGenericOption = <T,>(value: T, currentValue: T, label: string, onClick: (value: T) => void, children?: React.ReactNode) => (
     <div
      key={label}
      onClick={() => onClick(value)}
      className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
    >
      <div className="flex items-center space-x-3">{children || <span>{label}</span>}</div>
      {currentValue === value && <CheckIcon className="w-5 h-5 text-indigo-500" />}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start sm:items-center justify-center p-4 animate-fade-in-bg" onClick={onClose}>
      <div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md text-gray-800 dark:text-gray-100 p-6 md:p-8 flex flex-col animate-modal-enter"
        style={{ maxHeight: 'calc(var(--vh, 1vh) * 90)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{T.settingsTitle}</h2>
            {/* Close 'X' button removed as per request */}
        </div>
        
        <div className="flex-grow space-y-5 overflow-y-auto -mr-4 pr-4">
            {/* Sound Section */}
            <div>
              <h3 className="font-semibold mb-2 px-1">{T.sound}</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-900/20 overflow-hidden">
                {soundOptions.map(opt => (
                  <div key={opt.id} onClick={() => onSettingsChange({ sound: opt.id })} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50">
                     <div className="flex items-center space-x-3">
                        <button onClick={(e) => handlePreview(e, opt.id)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Preview ${opt.label}`}>
                           {playingPreview === opt.id ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                        </button>
                        <span>{opt.label}</span>
                     </div>
                     {settings.sound === opt.id && <CheckIcon className="w-5 h-5 text-indigo-500" />}
                  </div>
                ))}
                <div onClick={() => onSettingsChange({ sound: Sound.CUSTOM })} className="flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50">
                   <div className="flex items-center space-x-3">
                      <button onClick={(e) => handlePreview(e, Sound.CUSTOM)} disabled={!settings.customSoundData} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Preview Custom Sound`}>
                         {playingPreview === Sound.CUSTOM ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                      </button>
                      <button onClick={handleUploadClick} className="focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded">
                        {T.upload}
                      </button>
                   </div>
                   {settings.sound === Sound.CUSTOM && <CheckIcon className="w-5 h-5 text-indigo-500" />}
                </div>
              </div>
            </div>

             {/* Alarm Mode Section */}
            <div>
              <h3 className="font-semibold mb-2 px-1">{T.alarmMode}</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-900/20 overflow-hidden">
                  {renderGenericOption(AlarmMode.SINGLE, settings.alarmMode, T.once, (alarmMode) => onSettingsChange({ alarmMode }))}
                  {renderGenericOption(AlarmMode.CONTINUOUS, settings.alarmMode, T.loop, (alarmMode) => onSettingsChange({ alarmMode }))}
              </div>
            </div>
            
            {/* Font Section */}
            <div>
              <h3 className="font-semibold mb-2 px-1">{T.font}</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-900/20 overflow-hidden">
                {renderGenericOption(AppFont.SANS, settings.font, FONT_NAMES[AppFont.SANS], (font) => onSettingsChange({ font }))}
                {renderGenericOption(AppFont.DIGITAL, settings.font, FONT_NAMES[AppFont.DIGITAL], (font) => onSettingsChange({ font }))}
                {renderGenericOption(AppFont.ROUNDED, settings.font, FONT_NAMES[AppFont.ROUNDED], (font) => onSettingsChange({ font }))}
              </div>
            </div>

            {/* Theme Section */}
            <div>
              <h3 className="font-semibold mb-2 px-1">{T.theme}</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-900/20 overflow-hidden">
                {renderGenericOption(Theme.LIGHT, settings.theme, T.light, (theme) => onSettingsChange({ theme }))}
                {renderGenericOption(Theme.DARK, settings.theme, T.dark, (theme) => onSettingsChange({ theme }))}
                {renderGenericOption(Theme.CUSTOM, settings.theme, T.custom, (theme) => onSettingsChange({ theme }), 
                  <div className="flex items-center space-x-3 relative">
                      <span>{T.custom}</span>
                      <div className="w-6 h-6 rounded-full border border-gray-400 dark:border-gray-500" style={{ backgroundColor: settings.customColor }}></div>
                      <input type="color" value={settings.customColor} onChange={e => onSettingsChange({customColor: e.target.value, theme: Theme.CUSTOM})} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
                  </div>
                )}
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h3 className="font-semibold mb-2 px-1">{T.language}</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-900/20 overflow-hidden">
                {renderGenericOption(Language.EN, settings.language, 'English', (language) => onSettingsChange({ language }))}
                {renderGenericOption(Language.ES, settings.language, 'Español', (language) => onSettingsChange({ language }))}
              </div>
            </div>
        </div>
        
        <div className="flex-shrink-0 mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-300 shadow-lg transform hover:scale-105"
          >
            {T.save}
          </button>
        </div>
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} accept=".mp3,.wav,.ogg,.m4a" className="hidden"/>
      </div>
    </div>
  );
};