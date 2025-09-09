import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  title: string;
  data: ChartData[];
  formatAsCurrency?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, formatAsCurrency = false }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4 group">
              <div className="w-1/3 text-sm text-gray-300 truncate text-right">{label}</div>
              <div className="w-2/3 flex items-center gap-2">
                <div className="flex-grow bg-gray-700 rounded-full h-6">
                  <div
                    className="bg-teal-500 h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                  >
                  </div>
                </div>
                 <div className="text-sm font-semibold text-white w-16 text-left">
                    {formatAsCurrency ? `$${value}` : value}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
         <p className="text-gray-400 text-sm">Not enough data to display.</p>
      )}
    </div>
  );
};

export default BarChart;