import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Plus, Trash2 } from 'lucide-react';
import type { Point } from '../utils/fitting';

interface DataInputProps {
  data: Point[];
  onChange: (data: Point[]) => void;
}

const DataInput: React.FC<DataInputProps> = ({ data, onChange }) => {
  const [inputText, setInputText] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const newData: Point[] = [];
        results.data.forEach((row: any) => {
          if (row.length >= 2) {
            const x = parseFloat(row[0]);
            const y = parseFloat(row[1]);
            if (!isNaN(x) && !isNaN(y)) {
              newData.push([x, y]);
            }
          }
        });
        onChange([...data, ...newData]);
      },
    });
  };

  const handleManualAdd = () => {
    try {
      if (!inputText.trim()) {
        alert('请输入数据');
        return;
      }

      let newData: Point[] = [];
      if (inputText.trim().startsWith('[')) {
         const parsed = JSON.parse(inputText);
         if (Array.isArray(parsed)) {
            newData = parsed.filter(p => Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]))
                            .map(p => [Number(p[0]), Number(p[1])]);
         }
      } else {
        const lines = inputText.split('\n');
        lines.forEach(line => {
          // 支持中英文逗号、分号、空格和制表符作为分隔符
          const parts = line.split(/[,\s，;；\t]+/).filter(Boolean);
          if (parts.length >= 2) {
            const x = parseFloat(parts[0]);
            const y = parseFloat(parts[1]);
            if (!isNaN(x) && !isNaN(y)) {
              newData.push([x, y]);
            }
          }
        });
      }
      
      if (newData.length > 0) {
        onChange([...data, ...newData]);
        setInputText('');
      } else {
        alert('未能识别出有效数据。请检查格式，如 "1, 2" 或使用空格分隔 "1 2"');
      }
    } catch (e) {
      alert('数据格式不正确，请使用如 "1,2\\n3,4" 或 JSON 数组 [[1,2], [3,4]]');
    }
  };

  const removePoint = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">数据输入</h2>
        {data.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('确定要清空所有数据吗？')) {
                onChange([]);
              }
            }}
            className="text-red-500 hover:text-red-700 flex items-center text-sm px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} className="mr-1" /> 清空数据
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">手动输入 (支持 X,Y 或 JSON)</label>
        <textarea 
          className="w-full border rounded-md p-2 text-gray-800" 
          rows={3} 
          placeholder="例如:&#10;1, 2&#10;3, 4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button 
          type="button"
          onClick={handleManualAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" /> 添加数据
        </button>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer">
        <Upload size={24} className="text-gray-400 mb-2" />
        <span className="text-sm text-gray-600">点击上传 CSV/JSON 文件</span>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept=".csv,.json,text/csv,application/json"
          onChange={handleFileUpload}
        />
      </div>

      <div className="mt-4 max-h-64 overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-2">X</th>
              <th className="px-4 py-2">Y</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, i) => (
              <tr key={i} className="bg-white border-b">
                <td className="px-4 py-2">{point[0]}</td>
                <td className="px-4 py-2">{point[1]}</td>
                <td className="px-4 py-2">
                  <button onClick={() => removePoint(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="text-center py-4 text-gray-500">暂无数据</div>}
      </div>
    </div>
  );
};

export default DataInput;
