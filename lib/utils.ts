import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate' ? accurateSizes[i] ?? 'Bytest' : sizes[i] ?? 'Bytes'
  }`;
}

export const convertXlsxToCsv = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { header: 1 });

  if (jsonData.length < 2) {
    throw new Error('The file must contain at least a header row and one data row');
  }

  const headers = jsonData[0] as unknown as string[];
  const rows = jsonData.slice(1);

  const csvContent = Papa.unparse({
    fields: headers,
    data: rows,
  });
  return csvContent;
};

export const convertCsvToXlsx = async (file: File): Promise<Blob> => {
  const text = await file.text();
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

export async function parseFile(file: File) {
  return new Promise((resolve, reject) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          resolve(results.data);
        },
        header: true,
        error: (error) => {
          reject(error);
        },
      });
    } else if (file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      reject(new Error('Unsupported file format'));
    }
  });
}

export function getNumericColumns(data: any[]) {
  if (!data.length) return [];
  const firstRow = data[0];
  return Object.keys(firstRow).filter((key) => !isNaN(Number(firstRow[key])) && firstRow[key] !== '');
}

export function getAllColumns(data: any[]) {
  if (!data.length) return [];
  return Object.keys(data[0]);
}

export function aggregateData(data: any[], xAxis: string, yAxis: string, operation: string, groupBy?: string | null) {
  const grouped = data.reduce((acc, curr) => {
    const key = curr[xAxis];
    const groupKey = groupBy ? curr[groupBy] : 'default';

    if (!acc[key]) {
      acc[key] = {};
    }
    if (!acc[key][groupKey]) {
      acc[key][groupKey] = [];
    }

    acc[key][groupKey].push(Number(curr[yAxis]) || 1);
    return acc;
  }, {});

  return Object.entries(grouped).map(([key, groups]: [string, any]) => {
    const result: any = { [xAxis]: key };

    Object.entries(groups).forEach(([groupKey, values]: [string, any]) => {
      let value;
      switch (operation) {
        case 'sum':
          value = (values as number[]).reduce((a, b) => a + b, 0);
          break;
        case 'average':
          value = (values as number[]).reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'max':
          value = Math.max(...(values as number[]));
          break;
        case 'min':
          value = Math.min(...(values as number[]));
          break;
        case 'count':
        default:
          value = values.length;
          break;
      }
      result[groupKey === 'default' ? yAxis : `${groupKey}`] = value;
    });

    return result;
  });
}
