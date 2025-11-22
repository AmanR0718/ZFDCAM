// src/components/Chart.tsx
import React from 'react';

interface ChartProps {
  type: 'line' | 'doughnut' | 'bar';
  data: any;
  options?: any;
  height?: number;
}

const ChartComponent: React.FC<ChartProps> = ({ type, data, options, height }) => {
  return <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: '8px' }}>Chart unavailable</div>;
};

export default ChartComponent;
