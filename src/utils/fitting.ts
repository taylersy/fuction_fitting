import regression from 'regression';
import type { Result } from 'regression';

export type Point = [number, number];
export type FittingType = 'linear' | 'exponential' | 'logarithmic' | 'power' | 'polynomial-2' | 'polynomial-3';

export interface FittingResult {
  equation: number[];
  string: string;
  points: Point[];
  predict: (x: number) => Point;
  r2: number;
}

export function fitData(data: Point[], type: FittingType): FittingResult | null {
  if (data.length < 2) return null;
  
  let result: Result;
  try {
    switch (type) {
      case 'linear':
        result = regression.linear(data);
        break;
      case 'exponential':
        result = regression.exponential(data);
        break;
      case 'logarithmic':
        result = regression.logarithmic(data);
        break;
      case 'power':
        result = regression.power(data);
        break;
      case 'polynomial-2':
        result = regression.polynomial(data, { order: 2 });
        break;
      case 'polynomial-3':
        result = regression.polynomial(data, { order: 3 });
        break;
      default:
        result = regression.linear(data);
    }
    return {
      equation: result.equation,
      string: result.string,
      points: result.points as Point[],
      predict: result.predict as (x: number) => Point,
      r2: result.r2,
    };
  } catch (error) {
    console.error('Fitting error:', error);
    return null;
  }
}

export const modelNames: Record<FittingType, string> = {
  'linear': '一次函数 (Linear)',
  'polynomial-2': '二次函数 (Quadratic)',
  'polynomial-3': '三次函数 (Cubic)',
  'exponential': '指数函数 (Exponential)',
  'logarithmic': '对数函数 (Logarithmic)',
  'power': '幂函数 (Power)'
};
