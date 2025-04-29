import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

const ControlsPanel = ({ linhas }: { linhas: string[] }) => {
  return (
    <div className="flex flex-col gap-4">
      <ScrollArea className="h-full">
        <h1 className="text-lg font-bold">Linhas</h1>
        <div className="flex flex-col gap-1">
          {linhas.map((linha) => (
            <div key={linha} className="flex items-center gap-2">
              <Checkbox id={linha} />
              <Label htmlFor={linha}>{linha}</Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ControlsPanel;
