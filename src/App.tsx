import { useState, useEffect } from 'react';
import DataInput from './components/DataInput';
import Chart from './components/Chart';
import { fitData, modelNames, type Point, type FittingType, type FittingResult } from './utils/fitting';

function App() {
  const [data, setData] = useState<Point[]>([
    [0, 131], [0.5, 140], [1, 149], [1.5, 155], [2, 161],
    [2.5, 168], [3, 173], [3.5, 176], [4, 177], [4.5, 180],
    [5, 181], [5.5, 179], [6, 177], [6.5, 171], [7, 168],
    [7.5, 163], [8, 155], [8.5, 147], [9, 140], [9.5, 131],
    [10, 129], [10.5, 118], [11, 105], [11.5, 95], [12, 88],
    [12.5, 83], [13, 81], [13.5, 79], [14, 78], [14.5, 80],
    [15, 77]
  ]);
  const [modelType, setModelType] = useState<FittingType>('polynomial-2');
  const [result, setResult] = useState<FittingResult | null>(null);
  const [yLine, setYLine] = useState<string>('120');

  useEffect(() => {
    if (data.length >= 2) {
      setResult(fitData(data, modelType));
    } else {
      setResult(null);
    }
  }, [data, modelType]);

  const parsedYLine = yLine ? parseFloat(yLine) : undefined;
  
  // Find intersection of fitted curve with y = target
  const getIntersections = () => {
    if (!result || parsedYLine === undefined || isNaN(parsedYLine)) return null;
    
    // For simple models we can solve algebraically, but for general cases, 
    // a simple numeric search over the data range (extended) might work for display purposes.
    // Let's do a simple scan for X between minX-50% and maxX+50%
    const xs = data.map(p => p[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const range = maxX - minX || 10;
    
    const intersections: Point[] = [];
    const step = range / 1000;
    
    let prevY = result.predict(minX - range)[1];
    
    for (let x = minX - range; x <= maxX + range; x += step) {
      const curY = result.predict(x)[1];
      if ((prevY - parsedYLine) * (curY - parsedYLine) <= 0) {
        // Linear interpolation for better precision
        const exactX = x - step * (curY - parsedYLine) / (curY - prevY);
        intersections.push([exactX, parsedYLine]);
      }
      prevY = curY;
    }
    
    return intersections;
  };

  const intersections = getIntersections();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">函数拟合与可视化工具</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <DataInput data={data} onChange={setData} />
            
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-xl font-bold text-gray-800">模型设置</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择拟合模型</label>
                <select 
                  value={modelType} 
                  onChange={(e) => setModelType(e.target.value as FittingType)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(modelNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">几何计算 (求 y = ? 的交点)</label>
                <input 
                  type="number" 
                  value={yLine}
                  onChange={(e) => setYLine(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如: 120"
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">分析结果</h2>
              {result ? (
                <div className="space-y-2">
                  <p className="text-lg"><span className="font-semibold">函数解析式:</span> <code className="bg-gray-100 px-2 py-1 rounded">{result.string.startsWith('y =') ? result.string : `y = ${result.string}`}</code></p>
                  <p className="text-gray-600"><span className="font-semibold">R² (决定系数):</span> {result.r2.toFixed(4)}</p>
                  
                  {intersections && intersections.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                      <p className="font-semibold text-blue-800 mb-2">与直线 y = {yLine} 的交点坐标:</p>
                      <ul className="list-disc list-inside text-blue-700">
                        {intersections.map((p, i) => (
                          <li key={i}>({p[0].toFixed(4)}, {p[1].toFixed(4)})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">请至少输入两个数据点以进行拟合。</p>
              )}
            </div>
            
            <Chart data={data} result={result} yLine={parsedYLine} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
