import React from 'react';

interface Props {
  type: 'WiFi' | 'GSM' | 'Unknown';
  value: number | string;
}

export const SignalBars: React.FC<Props> = ({ type, value }) => {
  const numValue = parseInt(String(value), 10);
  let strength = 0; // 0-4 scale

  if (isNaN(numValue)) {
    strength = 0;
  } else if (type === 'WiFi') {
    // WiFi (dBm) - usually negative. Closer to 0 is better.
    // -50 or higher: Excellent (4)
    // -60 to -50: Good (3)
    // -70 to -60: Fair (2)
    // -80 to -70: Weak (1)
    // < -80: Bad (0)
    if (numValue >= -50) strength = 4;
    else if (numValue >= -60) strength = 3;
    else if (numValue >= -70) strength = 2;
    else if (numValue >= -80) strength = 1;
    else strength = 0;
  } else if (type === 'GSM') {
    // GSM (CSQ) - 0 to 31
    // 20-31: Excellent (4)
    // 15-19: Good (3)
    // 10-14: Fair (2)
    // 1-9: Weak (1)
    // 0 or 99: No Signal (0)
    if (numValue >= 20 && numValue !== 99) strength = 4;
    else if (numValue >= 15) strength = 3;
    else if (numValue >= 10) strength = 2;
    else if (numValue >= 1) strength = 1;
    else strength = 0;
  }

  const getColor = () => {
      if (strength === 0) return 'bg-slate-200';
      if (strength < 2) return 'bg-red-500';
      if (strength < 3) return 'bg-amber-400';
      return type === 'WiFi' ? 'bg-blue-500' : 'bg-emerald-500';
  };

  const activeColor = getColor();

  return (
    <div className="flex items-end gap-[2px] h-3.5" title={`${type} Signal: ${value}`} aria-label={`${type} Signal Strength: ${strength}/4`}>
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-[1px] transition-all duration-500 ${
            bar <= strength ? activeColor : 'bg-slate-200'
          }`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
};