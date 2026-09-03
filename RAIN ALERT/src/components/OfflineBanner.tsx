import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="sticky top-[60px] z-30 w-full bg-amber-500/90 text-gray-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4" />
      <span>Offline — displaying last available river data from local storage.</span>
    </div>
  );
};
