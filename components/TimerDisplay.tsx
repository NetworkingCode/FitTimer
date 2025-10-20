import React from 'react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  className?: string;
  isEditing?: boolean;
  onMinutesChange?: (value: number) => void;
  onSecondsChange?: (value: number) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ minutes, seconds, className, isEditing, onMinutesChange, onSecondsChange }) => {
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (onMinutesChange) {
        onMinutesChange(parseInt(value, 10) || 0);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      if (onSecondsChange) {
          onSecondsChange(parseInt(value, 10) || 0);
      }
  };

  if (isEditing) {
    return (
      <div className={`flex flex-col items-center justify-center w-full text-center tabular-nums leading-none ${className || ''}`}>
        <input
          aria-label="minutes"
          type="text"
          inputMode="numeric"
          value={String(minutes)}
          onChange={handleMinutesChange}
          onFocus={e => e.target.select()}
          className="text-[12rem] lg:text-[15rem] font-bold bg-transparent focus:outline-none w-full text-center"
          maxLength={2}
        />
        <input
          aria-label="seconds"
          type="text"
          inputMode="numeric"
          value={String(seconds)}
          onChange={handleSecondsChange}
          onFocus={e => e.target.select()}
          className="text-[12rem] lg:text-[15rem] font-bold -mt-8 lg:-mt-12 bg-transparent focus:outline-none w-full text-center"
          maxLength={2}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full text-center tabular-nums leading-none ${className || ''}`}>
      <div className="text-[12rem] lg:text-[15rem] font-bold">
        {String(minutes).padStart(2, '0')}
      </div>
      <div className="text-[12rem] lg:text-[15rem] font-bold -mt-8 lg:-mt-12">
        {String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};
