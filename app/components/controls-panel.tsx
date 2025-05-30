'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import * as React from 'react';

interface ControlsPanelProps {
  controlsEvents: ControlsEvents;
  setControlsEvents: (controlsEvents: ControlsEvents) => void;
  allColumns: string[];
}

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

const ControlsPanel = ({ controlsEvents, setControlsEvents, allColumns }: ControlsPanelProps) => {
  const {
    chartType,
    category,
    value,
    operation,
    groupBy,
    isStacked,
    averageReferenceLine,
    minReferenceLine,
    maxReferenceLine,
    legend,
  } = controlsEvents;

  const setChartType = (chartType: 'line' | 'bar') => setControlsEvents({ ...controlsEvents, chartType });
  const setCategory = (category: string) => setControlsEvents({ ...controlsEvents, category });
  const setValue = (value: string) => setControlsEvents({ ...controlsEvents, value });
  const setOperation = (operation: string) => setControlsEvents({ ...controlsEvents, operation });
  const setGroupBy = (groupBy: string) => setControlsEvents({ ...controlsEvents, groupBy });
  const setIsStacked = (isStacked: boolean) => setControlsEvents({ ...controlsEvents, isStacked });
  const setAverageReferenceLine = (averageReferenceLine: boolean) =>
    setControlsEvents({ ...controlsEvents, averageReferenceLine });
  const setMinReferenceLine = (minReferenceLine: boolean) => setControlsEvents({ ...controlsEvents, minReferenceLine });
  const setMaxReferenceLine = (maxReferenceLine: boolean) => setControlsEvents({ ...controlsEvents, maxReferenceLine });
  const setLegend = (legend: { show: boolean; align: 'left' | 'right' | 'center'; numberOfColumns: string }) =>
    setControlsEvents({ ...controlsEvents, legend });

  return (
    <div className="flex flex-col gap-4">
      {/* chart type */}
      <RadioGroup
        value={chartType}
        onValueChange={(v) => setChartType(v as 'line' | 'bar')}
        className="flex gap-0 -space-y-px rounded-sm"
      >
        <div className="border-input w-full has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex flex-col justify-center items-center gap-4 border p-2 outline-none first:rounded-l-sm last:rounded-r-sm">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="bar" value="bar" className="after:absolute after:inset-0" />
            <Label className="inline-flex items-start" htmlFor="bar">
              Colunas
            </Label>
          </div>
        </div>
        <div className="border-input w-full has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex flex-col justify-center items-center gap-4 border p-2 outline-none first:rounded-l-sm last:rounded-r-sm">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="line" value="line" className="after:absolute after:inset-0" />
            <Label className="inline-flex items-start" htmlFor="line">
              Linhas
            </Label>
          </div>
        </div>
      </RadioGroup>

      {/* x axis */}
      <div className="flex gap-x-2">
        <Label>Eixo X: </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o eixo X" />
          </SelectTrigger>
          <SelectContent>
            {allColumns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* y axis */}
      <div className="flex gap-x-2">
        <Label>Eixo Y: </Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o eixo Y" />
          </SelectTrigger>
          <SelectContent>
            {allColumns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* operation */}
      <div className="flex gap-x-2">
        <Label>Operação: </Label>
        <Select value={operation} onValueChange={setOperation}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a operação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="count">Count</SelectItem>
            <SelectItem value="sum">Sum</SelectItem>
            <SelectItem value="average">Average</SelectItem>
            <SelectItem value="max">Maximum</SelectItem>
            <SelectItem value="min">Minimum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* group by */}
      <div className="flex gap-x-2">
        <Label>Agrupar por:</Label>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o eixo Y" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {allColumns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-x-2">
        <Switch checked={isStacked} id="stacked" onCheckedChange={setIsStacked} />
        <Label htmlFor="stacked" className="cursor-pointer">
          Empilhar
        </Label>
      </div>

      {/* reference line */}
      <div className="flex flex-col p-4 border gap-y-4 rounded-sm">
        <Label>Linhas de referência</Label>
        <div className="flex gap-x-2">
          <Checkbox
            id="average-reference-line"
            checked={averageReferenceLine}
            onCheckedChange={setAverageReferenceLine}
          />
          <Label htmlFor="average-reference-line" className="cursor-pointer">
            Linha média
          </Label>
        </div>

        <div className="flex gap-x-2">
          <Checkbox id="min-reference-line" checked={minReferenceLine} onCheckedChange={setMinReferenceLine} />
          <Label htmlFor="min-reference-line" className="cursor-pointer">
            Linha mínima
          </Label>
        </div>

        <div className="flex gap-x-2">
          <Checkbox id="max-reference-line" checked={maxReferenceLine} onCheckedChange={setMaxReferenceLine} />
          <Label htmlFor="max-reference-line" className="cursor-pointer">
            Linha máxima
          </Label>
        </div>
      </div>

      {/* legend */}
      <div className="flex flex-col p-4 border gap-y-4 rounded-sm">
        <div className="flex items-center gap-x-2">
          <Switch
            checked={legend.show}
            id="show-legend"
            onCheckedChange={() => setLegend({ ...legend, show: !legend.show })}
          />
          <Label htmlFor="show-legend" className="cursor-pointer">
            Mostrar legenda
          </Label>
        </div>

        <div className="flex items-center gap-x-2">
          <Select
            value={legend.align}
            onValueChange={(v) => setLegend({ ...legend, align: v as 'left' | 'right' | 'center' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a posição da legenda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-x-2">
          <Select value={legend.numberOfColumns} onValueChange={(v) => setLegend({ ...legend, numberOfColumns: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o número de colunas da legenda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;
