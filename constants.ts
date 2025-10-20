import { Language, AppFont, Sound, Theme, type Settings, AlarmMode } from './types';

export const DEFAULT_SETTINGS: Settings = {
  minutes: 5,
  seconds: 0,
  sound: Sound.RALLY_X,
  font: AppFont.SANS,
  language: Language.EN,
  theme: Theme.LIGHT,
  customColor: '#e0e7ff',
  customSoundData: null,
  alarmMode: AlarmMode.SINGLE,
};

export const FONT_CLASSES: Record<AppFont, string> = {
  [AppFont.SANS]: 'font-sans',
  [AppFont.DIGITAL]: 'font-digital',
  [AppFont.ROUNDED]: 'font-rounded',
};

export const FONT_NAMES: Record<AppFont, string> = {
  [AppFont.SANS]: 'Sans Serif',
  [AppFont.DIGITAL]: 'Digital',
  [AppFont.ROUNDED]: 'Rounded',
};

export const THEME_CLASSES: Record<Theme, { bg: string; text: string; settings: string }> = {
  [Theme.LIGHT]: { bg: 'bg-gray-100', text: 'text-gray-800', settings: 'bg-white/70' },
  [Theme.DARK]: { bg: 'bg-gray-900', text: 'text-gray-100', settings: 'bg-gray-800/70' },
  [Theme.CUSTOM]: { bg: '', text: 'text-gray-900', settings: 'bg-white/30' },
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    title: 'FitTimer',
    minutes: 'Minutes',
    seconds: 'Seconds',
    start: 'Start',
    stop: 'Stop',
    sound: 'Sound',
    font: 'Font',
    theme: 'Background',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    custom: 'Custom',
    rallyX: 'Rally-X',
    moonPatrol: 'Moon Patrol',
    elevatorAction: 'Elevator Action',
    upload: 'Upload',
    settingsTitle: 'Settings',
    tapToStop: 'Tap anywhere to stop the alarm',
    alarmMode: 'Alarm Mode',
    once: 'Once',
    loop: 'Loop',
    save: 'Save',
    cancel: 'Cancel',
  },
  [Language.ES]: {
    title: 'FitTimer',
    minutes: 'Minutos',
    seconds: 'Segundos',
    start: 'Iniciar',
    stop: 'Detener',
    sound: 'Sonido',
    font: 'Fuente',
    theme: 'Fondo',
    language: 'Idioma',
    light: 'Claro',
    dark: 'Oscuro',
    custom: 'Personalizado',
    rallyX: 'Rally-X',
    moonPatrol: 'Moon Patrol',
    elevatorAction: 'Elevator Action',
    upload: 'Subir',
    settingsTitle: 'Configuración',
    tapToStop: 'Toca en cualquier lugar para detener la alarma',
    alarmMode: 'Modo de Alarma',
    once: 'Una vez',
    loop: 'Repetir',
    save: 'Guardar',
    cancel: 'Cancelar',
  },
};