import React from 'react';

const Sparkline = ({ data = [], color = 'text-accent-500', height = 32, width = 80 }) => {
  if (!data || data.length <= 1) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // Subtract from height to invert Y axis for SVG rendering
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={`overflow-visible ${color}`} height={height} width={width}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default Sparkline;
