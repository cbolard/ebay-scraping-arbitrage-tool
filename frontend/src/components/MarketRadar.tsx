import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceArea, ReferenceLine } from 'recharts';
import { MarketProduct } from '../hooks/useMarketData';
import { ShoppingCart } from 'lucide-react';

interface Props {
    products: MarketProduct[];
    hoveredProductId: string | null;
    setHoveredProductId: (id: string | null) => void;
    zoomDomain: { x: [number, number]; y: [number, number] } | null;
    setZoomDomain: (domain: { x: [number, number]; y: [number, number] } | null) => void;
}

const parseFrenchDate = (dateStr: string): number => {
    // Example: "14 nov. 2024"
    const months: { [key: string]: number } = {
        'janv.': 0, 'févr.': 1, 'mars': 2, 'avr.': 3, 'mai': 4, 'juin': 5,
        'juil.': 6, 'août': 7, 'sept.': 8, 'oct.': 9, 'nov.': 10, 'déc.': 11,
        'janvier': 0, 'février': 1, 'avril': 3, 'juillet': 6, 'novembre': 10, 'décembre': 11
    };

    try {
        const parts = dateStr.split(' ');
        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1].toLowerCase().replace('.', '');
            // Handle abbreviated months with or without dot
            let month = -1;
            for (const key in months) {
                if (key.startsWith(monthStr) || monthStr.startsWith(key.replace('.', ''))) {
                    month = months[key];
                    break;
                }
            }
            const year = parseInt(parts[2]);

            if (month !== -1) {
                return new Date(year, month, day).getTime();
            }
        }
    } catch (e) {
        console.error("Date parse error", dateStr, e);
    }
    return new Date().getTime(); // Fallback
};

export const MarketRadar = ({
    products,
    hoveredProductId,
    setHoveredProductId,
    zoomDomain,
    setZoomDomain
}: Props) => {
    // Zoom State
    const [refAreaLeft, setRefAreaLeft] = useState<string | number | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | number | null>(null);
    const [refAreaTop, setRefAreaTop] = useState<string | number | null>(null);
    const [refAreaBottom, setRefAreaBottom] = useState<string | number | null>(null);

    // Transform data
    const data = products.map(p => ({
        x: parseFrenchDate(p.date),
        y: p.totalPrice,
        z: 100, // Fixed size or based on something else?
        name: p.title,
        link: p.link,
        condition: p.condition,
        image: p.image,
        id: p.link
    }));

    const zoom = () => {
        if (refAreaLeft === refAreaRight || refAreaTop === refAreaBottom) {
            setRefAreaLeft(null);
            setRefAreaRight(null);
            setRefAreaTop(null);
            setRefAreaBottom(null);
            return;
        }

        // Ensure correct order
        let xMin = Math.min(Number(refAreaLeft), Number(refAreaRight));
        let xMax = Math.max(Number(refAreaLeft), Number(refAreaRight));
        let yMin = Math.min(Number(refAreaBottom), Number(refAreaTop));
        let yMax = Math.max(Number(refAreaBottom), Number(refAreaTop));

        setZoomDomain({ x: [xMin, xMax], y: [yMin, yMax] });

        setRefAreaLeft(null);
        setRefAreaRight(null);
        setRefAreaTop(null);
        setRefAreaBottom(null);
    };

    const zoomOut = () => {
        setZoomDomain(null);
    };

    const formatXAxis = (tickItem: number) => {
        return new Date(tickItem).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="glass-panel rounded-xl p-6 h-full flex flex-col select-none">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-off-white tracking-tight flex items-center">
                    Market Trends (Price vs Time)
                    {zoomDomain && (
                        <button
                            onClick={zoomOut}
                            className="ml-4 text-xs bg-indigo-accent/20 text-indigo-accent px-2 py-1 rounded hover:bg-indigo-accent/30 transition-colors"
                        >
                            Reset Zoom
                        </button>
                    )}
                </h2>
                {/* Legend */}
                <div className="flex items-center space-x-4 text-xs text-muted">
                    <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                        Neuf
                    </div>
                    <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        Occasion
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                        onMouseDown={(e) => {
                            if (!e) return;
                            setRefAreaLeft(e.xValue);
                            setRefAreaTop(e.yValue);
                        }}
                        onMouseMove={(e) => {
                            if (!e) return;
                            if (refAreaLeft) {
                                setRefAreaRight(e.xValue);
                                setRefAreaBottom(e.yValue);
                            }
                            // Sync Hover
                            if (e.isTooltipActive && e.activePayload && e.activePayload.length) {
                                const id = e.activePayload[0].payload.id;
                                if (id !== hoveredProductId) {
                                    setHoveredProductId(id);
                                }
                            } else if (hoveredProductId) {
                                setHoveredProductId(null);
                            }
                        }}
                        onMouseUp={zoom}
                    >
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Date"
                            domain={zoomDomain ? zoomDomain.x : ['auto', 'auto']}
                            tickFormatter={formatXAxis}
                            stroke="#404040"
                            tick={{ fill: '#888888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#404040' }}
                            allowDataOverflow
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Price"
                            unit="€"
                            domain={zoomDomain ? zoomDomain.y : ['auto', 'auto']}
                            stroke="#404040"
                            tick={{ fill: '#888888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#404040' }}
                            allowDataOverflow
                        />
                        <ZAxis type="number" dataKey="z" range={[50, 50]} />

                        <Tooltip
                            cursor={{ strokeDasharray: '3 3', stroke: '#6366f1' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div
                                            className="bg-obsidian/95 border border-glass-border backdrop-blur-xl p-4 rounded-lg shadow-2xl max-w-[280px] pointer-events-auto"
                                            onMouseEnter={() => setHoveredProductId(data.id)}
                                        >
                                            <p className="text-sm font-medium text-off-white mb-3 line-clamp-2 leading-snug">{data.name}</p>

                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <span className="text-2xl font-bold text-white">{data.y}€</span>
                                                    <div className="text-xs text-muted mt-1">{data.condition}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-muted">{new Date(data.x).toLocaleDateString()}</div>
                                                </div>
                                            </div>

                                            <a
                                                href={data.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full bg-indigo-accent hover:bg-indigo-600 text-white py-2 rounded-lg font-bold text-xs tracking-wide transition-colors shadow-lg shadow-indigo-accent/20"
                                            >
                                                <ShoppingCart size={14} className="mr-2" />
                                                VIEW LISTING
                                            </a>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Scatter data={data} fill="#888888">
                            {data.map((entry, index) => {
                                const isNew = entry.condition.toLowerCase().includes('neuf') || entry.condition.toLowerCase().includes('new');
                                const color = isNew ? '#10b981' : '#eab308'; // Emerald for New, Yellow for Used

                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={color}
                                        fillOpacity={hoveredProductId === entry.id ? 1 : 0.6}
                                        stroke={hoveredProductId === entry.id ? '#fff' : 'none'}
                                        strokeWidth={2}
                                        className="transition-all duration-200"
                                    />
                                );
                            })}
                        </Scatter>

                        {/* Zoom Selection Box */}
                        {refAreaLeft && refAreaRight && (
                            <ReferenceArea
                                x1={refAreaLeft}
                                x2={refAreaRight}
                                y1={refAreaTop}
                                y2={refAreaBottom}
                                strokeOpacity={0.3}
                                fill="#6366f1"
                                fillOpacity={0.1}
                            />
                        )}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
