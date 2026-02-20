import React from 'react';

interface BridgeProgressBarProps {
  current: number;
  total: number;
  colorClass: string;
  onExit: () => void;
  labelPrefix?: string;
}

export const BridgeProgressBar: React.FC<BridgeProgressBarProps> = ({ 
  current, 
  total, 
  colorClass, 
  onExit,
  labelPrefix = 'Card'
}) => {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
        <span>{labelPrefix} {current + 1} of {total}</span>
        <button onClick={onExit} className="text-gray-600 hover:text-gray-900 hover:underline">Exit</button>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${colorClass} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
