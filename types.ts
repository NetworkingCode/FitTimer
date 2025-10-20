export enum Language {
  EN = 'en',
  ES = 'es',
}

export enum AppFont {
  SANS = 'sans',
  DIGITAL = 'digital',
  ROUNDED = 'rounded',
}

export enum Sound {
  RALLY_X = 'rally-x',
  MOON_PATROL = 'moon-patrol',
  ELEVATOR_ACTION = 'elevator-action',
  CUSTOM = 'custom',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  CUSTOM = 'custom',
}

export enum AlarmMode {
  SINGLE = 'single',
  CONTINUOUS = 'continuous',
}

export interface Settings {
  minutes: number;
  seconds: number;
  sound: Sound;
  font: AppFont;
  language: Language;
  theme: Theme;
  customColor: string;
  customSoundData: string | null;
  alarmMode: AlarmMode;
}