'use client';

import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, Marker, TileLayer, ZoomControl } from 'react-leaflet';
import { BusData } from '../types/types';

const DeliveryMap = ({ data }: { data: BusData[] | undefined }) => {
  return (
    <MapContainer
      center={[Number('-22,90324 '.replace(',', '.')), Number('-43,26969'.replace(',', '.'))]}
      zoom={11}
      zoomControl={false}
      className="w-full h-full [&_.leaflet-control-attribution]:hidden pointer-events-auto"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="grayscale"
      />

      <ZoomControl position="bottomleft" />

      {/* Buses Marker */}
      {data?.map((busData) => (
        <Marker
          position={[Number(busData.latitude.replace(',', '.')), Number(busData.longitude.replace(',', '.'))]}
          icon={
            new L.DivIcon({
              className: 'custom-marker',
              html: ReactDOMServer.renderToString(
                <span className="relative flex size-6 items-center justify-center">
                  <span className="absolute rounded-full bg-orange-500/25 size-4" />
                  <span className="absolute rounded-full bg-orange-500/50 size-3" />
                  <span className="absolute rounded-full bg-orange-500 size-2 flex items-center justify-center" />
                </span>
              ),
            })
          }
          key={busData.ordem}
        />
      ))}
    </MapContainer>
  );
};

export default DeliveryMap;
