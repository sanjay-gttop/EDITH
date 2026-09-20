import { useEffect, useRef, type FC } from 'react';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
  className?: string;
}

export const MapPlaceholder: FC<MapPlaceholderProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    try {
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [-122.4194, 37.7749], // San Francisco default staging coordinates
        zoom: 12,
      });

      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    } catch (err) {
      console.warn('MapLibre GL map initialization deferred in offline/mock environment:', err);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800 ${className || 'h-80'}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 flex items-center gap-2 pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-rose-400" />
        <span>Incident Grid & Unit Telemetry (MapLibre GL)</span>
      </div>
    </div>
  );
};
