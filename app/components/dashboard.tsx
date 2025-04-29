'use client';

import ControlsPanel from '@/app/components/controls-panel';
import { FileUploader } from '@/components/file-uploader';
import DataVisualizer from '@/components/visualizer';
import { getAllColumns, parseFile } from '@/lib/utils';
import * as React from 'react';

export interface ControlsEvents {
  chartType: 'line' | 'bar';
  category: string;
  value: string;
  groupBy: string;
  operation: string;
  isStacked: boolean;
  averageReferenceLine: boolean;
  minReferenceLine: boolean;
  maxReferenceLine: boolean;
  legend: {
    show: boolean;
    align: 'left' | 'right' | 'center';
    numberOfColumns: string;
  };
}

const Dashboard = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [controlsEvents, setControlsEvents] = React.useState<ControlsEvents>({
    chartType: 'bar',
    category: '',
    value: '',
    groupBy: '',
    operation: 'count',
    isStacked: false,
    averageReferenceLine: false,
    minReferenceLine: false,
    maxReferenceLine: false,
    legend: {
      show: true,
      align: 'center',
      numberOfColumns: '1',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processDateColumns = (data: any[]) => {
    if (!data.length) return data;

    return data.map((row) => {
      Object.entries(row).forEach(([key, value]) => {
        const typedValue = value as string | number | Date;
        if (typedValue !== null && typedValue !== '' && !isNaN(new Date(typedValue).getTime())) {
          const date = new Date(typedValue);
          row[`${key}_year`] = String(date.getFullYear());
          row[`${key}_month`] = String(date.getMonth() + 1).padStart(2, '0');
          row[`${key}_day`] = String(date.getDate()).padStart(2, '0');
          row[`${key}_hour`] = String(date.getHours()).padStart(2, '0');
          row[`${key}_date`] = date.toISOString().split('T')[0];
          row[`${key}_day_of_week`] = date.toLocaleDateString('en-US', { weekday: 'long' });
          delete row[key];
        }
      });
      return row;
    });
  };

  const handleFileUpload = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setLoading(true);
    const parsedData = await parseFile(file);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedData = processDateColumns(parsedData as any[]);
    setData(processedData);
    setLoading(false);
  }, []);

  const allColumns = React.useMemo(() => getAllColumns(data), [data]);

  return (
    <div className="grid grid-cols-[25%_75%] w-full">
      <div className="border-r h-full p-6">
        <ControlsPanel allColumns={allColumns} controlsEvents={controlsEvents} setControlsEvents={setControlsEvents} />
      </div>

      <div className="flex h-full w-full items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">Processando arquivo...</div>
        ) : data.length > 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <DataVisualizer
              data={data}
              chartType={controlsEvents.chartType}
              category={controlsEvents.category}
              value={controlsEvents.value}
              groupBy={controlsEvents.groupBy}
              operation={controlsEvents.operation}
              isStacked={controlsEvents.isStacked}
              averageReferenceLine={controlsEvents.averageReferenceLine}
              minReferenceLine={controlsEvents.minReferenceLine}
              maxReferenceLine={controlsEvents.maxReferenceLine}
              legend={controlsEvents.legend}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileUploader
              accept={{
                'text/csv': [],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
                'application/vnd.ms-excel': [],
              }}
              multiple={false}
              maxSize={100 * 1024 * 1024}
              maxFileCount={1}
              onValueChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
