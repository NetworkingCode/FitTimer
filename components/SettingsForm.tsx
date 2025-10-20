
import React from 'react';
import { Settings, Language, AppFont, Sound, Theme } from '../types';
import { TRANSLATIONS, FONT_NAMES } from '../constants';
import { CheckIcon } from './icons/CheckIcon';

interface SettingsFormProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  onStart: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSettingsChange, onStart }) => {
  const T = TRANSLATIONS[settings.language];

  const renderOption = <T,>(value: T, currentValue: T, label: string, onClick: (value: T) => void) => (
    <button
      key={label}
      onClick={() => onClick(value)}
      className={`relative px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
        currentValue === value ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
      {currentValue === value && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-400">
            <CheckIcon className="w-3 h-3 text-white" />
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 space-y-8">
      <h1 className="text-5xl font-bold tracking-tight">{T.title}</h1>

      <div className="w-full text-center">
        <label htmlFor="minutes" className="text-lg">{T.minutes}</label>
        <input
          id="minutes"
          type="number"
          min="1"
          value={settings.minutes}
          onChange={(e) => onSettingsChange({ minutes: parseInt(e.target.value, 10) || 1 })}
          className="w-40 text-center text-6xl font-bold bg-transparent border-b-2 border-current focus:outline-none"
        />
      </div>
      
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
            <span className="font-semibold">{T.sound}</span>
            <div className="flex space-x-2">
                {renderOption(Sound.RALLY_X, settings.sound, T.rallyX, (sound) => onSettingsChange({ sound }))}
                {renderOption(Sound.MOON_PATROL, settings.sound, T.moonPatrol, (sound) => onSettingsChange({ sound }))}
                {renderOption(Sound.ELEVATOR_ACTION, settings.sound, T.elevatorAction, (sound) => onSettingsChange({ sound }))}
            </div>
        </div>
        <div className="flex justify-between items-center">
            <span className="font-semibold">{T.font}</span>
            <div className="flex space-x-2">
                {renderOption(AppFont.SANS, settings.font, FONT_NAMES[AppFont.SANS], (font) => onSettingsChange({ font }))}
                {renderOption(AppFont.DIGITAL, settings.font, FONT_NAMES[AppFont.DIGITAL], (font) => onSettingsChange({ font }))}
                {renderOption(AppFont.ROUNDED, settings.font, FONT_NAMES[AppFont.ROUNDED], (font) => onSettingsChange({ font }))}
            </div>
        </div>
         <div className="flex justify-between items-center">
            <span className="font-semibold">{T.theme}</span>
            <div className="flex space-x-2 items-center">
                {renderOption(Theme.LIGHT, settings.theme, T.light, (theme) => onSettingsChange({ theme }))}
                {renderOption(Theme.DARK, settings.theme, T.dark, (theme) => onSettingsChange({ theme }))}
                <div className="relative">
                    {renderOption(Theme.CUSTOM, settings.theme, T.custom, (theme) => onSettingsChange({ theme }))}
                    <input type="color" value={settings.customColor} onChange={e => onSettingsChange({customColor: e.target.value, theme: Theme.CUSTOM})} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
                </div>
            </div>
        </div>
         <div className="flex justify-between items-center">
            <span className="font-semibold">{T.language}</span>
            <div className="flex space-x-2">
                {renderOption(Language.EN, settings.language, 'English', (language) => onSettingsChange({ language }))}
                {renderOption(Language.ES, settings.language, 'Español', (language) => onSettingsChange({ language }))}
            </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 text-2xl font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-300 shadow-lg transform hover:scale-105"
      >
        {T.start}
      </button>
    </div>
  );
};