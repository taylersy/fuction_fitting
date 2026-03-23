import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Point, FittingResult } from '../utils/fitting';

interface ChartProps {
  data: Point[];
  result: FittingResult | null;
  yLine?: number;
}

const Chart: React.FC<ChartProps> = ({ data, result, yLine }) => {
  const option = useMemo(() => {
    const series: any[] = [
      {
        name: '原始数据',
        type: 'scatter',
        data: data,
        itemStyle: { color: '#3b82f6' },
      }
    ];

    if (result) {
      // Generate smooth line points
      const xValues = data.map(p => p[0]);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const step = (maxX - minX) / 100 || 1;
      
      const lineData: Point[] = [];
      for (let x = minX; x <= maxX; x += step) {
        lineData.push(result.predict(x));
      }
      
      series.push({
        name: '拟合曲线',
        type: 'line',
        showSymbol: false,
        data: lineData,
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 2 },
        smooth: true,
      });

      // Add intersection line if specified
      if (yLine !== undefined && !isNaN(yLine)) {
        series.push({
          name: `y = ${yLine}`,
          type: 'line',
          markLine: {
            silent: false,
            data: [{ yAxis: yLine }],
            lineStyle: { color: '#10b981', type: 'dashed' },
            label: { formatter: `y = ${yLine}` }
          }
        });
      }
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['原始数据', '拟合曲线', yLine !== undefined ? `y = ${yLine}` : undefined].filter(Boolean)
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'X',
        scale: true,
      },
      yAxis: {
        type: 'value',
        name: 'Y',
        scale: true,
      },
      series,
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, filterMode: 'empty' },
        { type: 'inside', yAxisIndex: 0, filterMode: 'empty' },
        { type: 'slider', xAxisIndex: 0, filterMode: 'empty' },
        { type: 'slider', yAxisIndex: 0, filterMode: 'empty' }
      ]
    };
  }, [data, result, yLine]);

  return (
    <div className="w-full h-[500px] bg-white rounded-lg shadow p-4">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default Chart;
