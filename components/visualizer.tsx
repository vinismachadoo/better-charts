'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { aggregateData, cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Label, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';

interface DataVisualizerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  chartType: 'line' | 'bar' | 'donut';
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

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export default function DataVisualizer({
  data,
  chartType,
  category,
  value,
  groupBy,
  operation,
  isStacked,
  averageReferenceLine,
  minReferenceLine,
  maxReferenceLine,
  legend,
}: DataVisualizerProps) {
  const formattedData = useMemo(() => {
    if (!category || !value) return [];
    if (!category || !value) return [];
    return aggregateData(data, category, value, operation, groupBy || null);
  }, [data, category, value, operation, groupBy]);

  const uniqueGroups = useMemo(() => {
    if (!groupBy) return [];
    return Array.from(new Set(data.map((item) => item[groupBy])));
  }, [data, groupBy]);

  const stats = useMemo(() => {
    if (!formattedData.length) return { min: 0, max: 0, avg: 0 };

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    // Calculate total for each data point (bar)
    formattedData.map((item) => {
      const total = Object.entries(item).reduce((acc, [key, value]) => {
        if (key !== category && typeof value === 'number') {
          return acc + value;
        }
        return acc;
      }, 0);

      min = Math.min(min, total);
      max = Math.max(max, total);
      sum += total;
      return total;
    });

    return {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      avg: formattedData.length > 0 ? sum / formattedData.length : 0,
    };
  }, [formattedData, category]);

  const chartConfig = useMemo(() => {
    // Get all unique keys from all objects, excluding delivery_carrier_name
    const allKeys = new Set<string>();
    formattedData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== category) {
          allKeys.add(key);
        }
      });
    });

    // Create config object with all keys
    return Array.from(allKeys).reduce((acc, key, index) => {
      acc[key] = {
        label: key,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  }, [formattedData, category]);

  console.log(`repeat(${legend.numberOfColumns ?? 1}, 1fr)`);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ChartContainer config={chartConfig}>
            <LineChart data={formattedData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey={category}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                // tickFormatter={(value) => value.slice(0, 3)} // format name of columns on x axis
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-fit"
                    formatter={(value, name, item, index) => {
                      const allColumnsLength = Object.keys(item.payload).length - 1;

                      const total = Object.keys(item.payload)
                        .filter((key) => key in chartConfig)
                        .reduce((sum, key) => sum + (item.payload[key] || 0), 0);

                      console.log(item);

                      return (
                        <>
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-xs bg-[var(--color-bg)]"
                            style={
                              {
                                '--color-bg': item.payload.fill || item.color,
                              } as React.CSSProperties
                            }
                          />
                          {name}
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {value}
                          </div>
                          {/* Add this after the last item */}
                          {index === allColumnsLength - 1 && (
                            <div className="mt-1 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                              Total
                              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                {total}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {groupBy ? (
                uniqueGroups.map((group, index) => (
                  <Line key={group} type="monotone" dataKey={group} stroke={COLORS[index % COLORS.length]} />
                ))
              ) : (
                <Line type="monotone" dataKey={value} stroke={COLORS[0]} />
              )}
            </LineChart>
          </ChartContainer>
        );
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart accessibilityLayer data={formattedData} margin={{ top: 10, right: 80, left: 10, bottom: 10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              {groupBy ? (
                uniqueGroups.map((group, index) => {
                  return (
                    <Bar
                      key={group}
                      dataKey={group}
                      fill={COLORS[index % COLORS.length]}
                      stackId={isStacked ? 'stack' : undefined}
                      // radius={
                      //   isStacked
                      //     ? index === 0
                      //       ? [0, 0, 4, 4]
                      //       : index === uniqueGroups.length - 1
                      //         ? [4, 4, 0, 0]
                      //         : 0
                      //     : 0
                      // }
                    />
                  );
                })
              ) : (
                <Bar dataKey={value} fill={COLORS[0]} />
              )}
              <XAxis dataKey={category} tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-fit"
                    formatter={(value, name, item, index) => {
                      const allColumnsLength = Object.keys(item.payload).length - 1;

                      const total = Object.keys(item.payload)
                        .filter((key) => key in chartConfig)
                        .reduce((sum, key) => sum + (item.payload[key] || 0), 0);

                      console.log(item);

                      return (
                        <>
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-xs bg-[var(--color-bg)]"
                            style={
                              {
                                '--color-bg': item.payload.fill || item.color,
                              } as React.CSSProperties
                            }
                          />
                          {name}
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {value}
                          </div>
                          {/* Add this after the last item */}
                          {index === allColumnsLength - 1 && (
                            <div className="mt-1 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                              Total
                              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                {total}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    }}
                  />
                }
              />
              {legend.show && (
                <ChartLegend
                  content={
                    <ChartLegendContent
                      style={{ '--num-cols': `repeat(${legend.numberOfColumns ?? 1}, 1fr)` } as React.CSSProperties}
                      className={cn(
                        'grid grid-cols-[var(--num-cols)] mt-4 w-fit justify-self-end flex-wrap gap-2 mx-6',
                        {
                          'justify-self-end': legend.align === 'right',
                          'justify-self-start': legend.align === 'left',
                          'justify-self-center': legend.align === 'center',
                        }
                      )}
                    />
                  }
                />
              )}
              {averageReferenceLine && (
                <ReferenceLine y={stats.avg} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeWidth={1}>
                  <Label position="right" value={`Avg: ${stats.avg.toFixed(2)}`} fill="var(--foreground)" offset={10} />
                </ReferenceLine>
              )}
              {minReferenceLine && (
                <ReferenceLine y={stats.min} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeWidth={1}>
                  <Label position="right" value={`Min: ${stats.min.toFixed(2)}`} fill="var(--foreground)" offset={10} />
                </ReferenceLine>
              )}
              {maxReferenceLine && (
                <ReferenceLine y={stats.max} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeWidth={1}>
                  <Label position="right" value={`Max: ${stats.max.toFixed(2)}`} fill="var(--foreground)" offset={10} />
                </ReferenceLine>
              )}
            </BarChart>
          </ChartContainer>
        );
      // case 'donut':
      //   return (
      //     <ResponsiveContainer width="100%" height={400}>
      //       <PieChart>
      //         <Pie
      //           data={processedData}
      //           dataKey={value}
      //           nameKey={category}
      //           cx="50%"
      //           cy="50%"
      //           innerRadius={60}
      //           outerRadius={80}
      //           fill="#8884d8"
      //           label
      //         >
      //           {processedData.map((_, index) => (
      //             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      //           ))}
      //         </Pie>
      //         <Tooltip />
      //         <Legend />
      //       </PieChart>
      //     </ResponsiveContainer>
      //   );
    }
  };

  return (
    <div className="flex flex-col w-full h-full items-center justify-center py-12 px-6">
      {!category || !value ? (
        <div className="text-center text-muted-foreground p-8">
          {chartType === 'donut'
            ? 'Selecione os eixos para visualizar seus dados'
            : 'Selecione os eixos para visualizar seus dados'}
        </div>
      ) : (
        renderChart()
      )}
    </div>
  );
}
