import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  duration?: number;
  onTimeUp?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  duration = 30,
  onTimeUp 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUp]);

  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / duration);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 140 140" 
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle 
          cx="70" 
          cy="70" 
          r={radius} 
          fill="transparent" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle 
          cx="70" 
          cy="70" 
          r={radius} 
          fill="transparent" 
          stroke="rgba(255,255,255,0.5)" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s linear'
          }}
        />
      </svg>
    </div>
  );
};

export default CountdownTimer;