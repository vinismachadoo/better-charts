'use client';

import ControlsPanel, { type ControlsEvents } from '@/app/components/controls-panel';
import { getAllColumns } from '@/lib/utils';
import { FileUploader } from '@/components/file-uploader';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import DataVisualizer from '@/components/visualizer';

interface ProcessedRow {
  [key: string]: string | number | null;
}

const Dashboard = () => {
  const [data, setData] = React.useState<ProcessedRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const [controlsEvents, setControlsEvents] = React.useState<ControlsEvents>({
    chartType: 'bar',
    category: '',
    value: '',
    groupBy: '',
    operation: 'count',
    isStacked: false,
    averageReferenceLine: true,
    minReferenceLine: true,
    maxReferenceLine: true,
    legend: {
      show: true,
      align: 'right',
      numberOfColumns: '4',
    },
  });

  const handleFileUpload = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    console.log('2');

    try {
      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let processedData: ProcessedRow[] = [];
      const decoder = new TextDecoder();
      let buffer = '';
      let totalRows = 0;
      let rowsProcessed = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            const parsed = JSON.parse(line);
            const { rows, isFirstChunk, totalRows: chunkTotalRows } = parsed;
            if (isFirstChunk && chunkTotalRows) {
              totalRows = chunkTotalRows;
            }
            if (Array.isArray(rows)) {
              if (isFirstChunk) {
                processedData = rows;
              } else {
                processedData = [...processedData, ...rows];
              }
              rowsProcessed += rows.length;
              if (totalRows > 0) {
                setProgress(Math.min(100, Math.round((rowsProcessed / totalRows) * 100)));
              }
            } else {
              console.error('rows is not iterable', rows);
            }
          }
        }
      }
      setProgress(100);

      setData(processedData);
    } catch (error) {
      console.error('Error processing file:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  }, []);

  const allColumns = React.useMemo(() => getAllColumns(data), [data]);

  return loading ? (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="w-4 h-4 animate-spin" />
      <div className="mt-2">{progress}%</div>
    </div>
  ) : data.length > 0 ? (
    <div className="grid grid-cols-[1fr_3fr] gap-4">
      <div className="border-r h-full p-6">
        <ControlsPanel allColumns={allColumns} controlsEvents={controlsEvents} setControlsEvents={setControlsEvents} />
      </div>

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
    </div>
  ) : (
    <div className="flex items-center justify-center h-full w-full">
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
  );
};

export default Dashboard;
