import React from "react";

interface AgeRangeSliderProps {
  minVal: number;
  maxVal: number;
  setMinVal: (val: number) => void;
  setMaxVal: (val: number) => void;
}

const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({ minVal, maxVal, setMinVal, setMaxVal }) => {
  const minLimit = 18;
  const maxLimit = 70;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - 2);
    setMinVal(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + 2);
    setMaxVal(value);
  };

  const minPercent = ((minVal - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((maxVal - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="space-y-2 p-1">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
        <span>Age Range:</span>
        <span className="text-maroon-700 dark:text-gold-450 font-bold">{minVal} - {maxVal} yrs</span>
      </div>
      <div className="relative w-full h-6 flex items-center select-none">
        <div className="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-dark-800 rounded-lg"></div>
        <div
          className="absolute h-1 bg-maroon-700 dark:bg-gold-500 rounded-lg"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        ></div>
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={minVal}
          onChange={handleMinChange}
          className="absolute pointer-events-none appearance-none z-20 w-full h-1 bg-transparent cursor-pointer range-slider-input"
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute pointer-events-none appearance-none z-20 w-full h-1 bg-transparent cursor-pointer range-slider-input"
        />
      </div>
    </div>
  );
};

export default AgeRangeSlider;
