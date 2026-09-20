import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';
export const MapPlaceholder = ({ className }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current)
            return;
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
        }
        catch (err) {
            console.warn('MapLibre GL map initialization deferred in offline/mock environment:', err);
        }
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);
    return (_jsxs("div", { className: `relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800 ${className || 'h-80'}`, children: [_jsx("div", { ref: mapContainer, className: "w-full h-full" }), _jsxs("div", { className: "absolute top-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 flex items-center gap-2 pointer-events-none", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-rose-400" }), _jsx("span", { children: "Incident Grid & Unit Telemetry (MapLibre GL)" })] })] }));
};
//# sourceMappingURL=MapPlaceholder.js.map