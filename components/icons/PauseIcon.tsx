import React from 'react';

interface PauseIconProps {
    className?: string;
}

export const PauseIcon: React.FC<PauseIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      fillRule="evenodd"
      d="M6.75 5.25a.75.75 0 00-.75.75v12a.75.75 0 001.5 0v-12a.75.75 0 00-.75-.75zm9 0a.75.75 0 00-.75.75v12a.75.75 0 001.5 0v-12a.75.75 0 00-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);