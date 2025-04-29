'use client';

import ControlsPanel from '@/app/buses/components/controls-panel';
import MapWrapper from '@/app/buses/components/map-wrapper';
import { BusData } from '@/app/buses/types/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

const LiveBuses = () => {
  const isMobile = useIsMobile();

  const { data, isLoading } = useQuery({
    queryKey: ['BUSES'],
    queryFn: async () => {
      const response = await fetch(`/api/buses`);
      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }
      return response.json();
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    select: (data: BusData[]) => {
      return Object.values(
        data.reduce(
          (acc, bus) => {
            if (!acc[bus.ordem] || new Date(bus.datahora) > new Date(acc[bus.ordem].datahora)) {
              acc[bus.ordem] = {
                ordem: bus.ordem,
                latitude: bus.latitude,
                longitude: bus.longitude,
                datahora: bus.datahora,
                velocidade: bus.velocidade,
                linha: bus.linha,
                datahoraenvio: bus.datahoraenvio,
                datahoraservidor: bus.datahoraservidor,
              };
            }
            return acc;
          },
          {} as Record<string, BusData>
        )
      );
    },
  });

  const linhas = React.useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((bus) => bus.linha))).sort();
  }, [data]);

  return (
    <div className="grid grid-cols-[1fr_3fr] h-screen w-screen">
      <div className="border-r">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <ControlsPanel linhas={linhas} />
        )}
      </div>
      <div>
        <MapWrapper data={data} />
      </div>
    </div>
  );
};

export default LiveBuses;
