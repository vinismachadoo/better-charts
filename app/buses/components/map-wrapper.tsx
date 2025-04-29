// app/tracking/components/map-wrapper.tsx
'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const DeliveryMap = dynamic(() => import('./map'), {
  ssr: false, // Disable server-side rendering
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="size-8 animate-spin" />
    </div>
  ),
});

export default DeliveryMap;
