import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { HistoryItem } from '../types';

// GeoJSON for the world map
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeoMapProps {
    history: HistoryItem[];
    highlightCountry?: string; // For single report view
}

const GeoMap: React.FC<GeoMapProps> = ({ history, highlightCountry }) => {

    // 1. Calculate Country Counts
    const countryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        history.forEach(item => {
            const country = item.data.meta.country;
            if (country) {
                // Normalize country names if needed (simple version for now)
                counts[country] = (counts[country] || 0) + 1;
            }
        });
        return counts;
    }, [history]);

    // 2. Create Color Scale
    const maxCount = Math.max(...Object.values(countryCounts), 0);
    const colorScale = scaleLinear<string>()
        .domain([0, maxCount || 1])
        .range(["#e2e8f0", "#6366f1"]); // Slate-200 to Indigo-500

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <ComposableMap
                projectionConfig={{
                    rotate: [-10, 0, 0],
                    scale: 147
                }}
            >
                <Sphere stroke="#E4E5E6" strokeWidth={0.5} id="sphere" fill="transparent" />
                <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
                <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const count = countryCounts[countryName] || 0;
                            const isHighlighted = highlightCountry && highlightCountry === countryName;

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={
                                        isHighlighted
                                            ? "#f43f5e" // Rose-500 for specific highlight
                                            : count > 0
                                                ? colorScale(count)
                                                : "#cbd5e1" // Slate-300 for default
                                    }
                                    stroke="#94a3b8"
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: {
                                            fill: isHighlighted ? "#e11d48" : "#4f46e5",
                                            outline: "none",
                                            cursor: "pointer"
                                        },
                                        pressed: { outline: "none" },
                                    }}
                                    title={`${countryName}: ${count} briefings`}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>

            {/* Legend / Info */}
            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
                    <span className="text-slate-600 dark:text-slate-300">High Activity</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-300 rounded-sm"></span>
                    <span className="text-slate-600 dark:text-slate-300">No Data</span>
                </div>
                {highlightCountry && (
                    <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
                        <span className="text-slate-600 dark:text-slate-300">Current Focus: {highlightCountry}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeoMap;
