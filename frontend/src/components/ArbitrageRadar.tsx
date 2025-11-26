import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceArea } from 'recharts';
import { AmazonProduct } from '../hooks/useAmazonData';
import { ShoppingCart } from 'lucide-react';

interface Props {
    products: AmazonProduct[];
    hoveredProductId: string | null;
    setHoveredProductId: (id: string | null) => void;
    zoomDomain: { x: [number, number]; y: [number, number] } | null;
    setZoomDomain: (domain: { x: [number, number]; y: [number, number] } | null) => void;
    thresholds: { price: number; rating: number } | null;
    setThresholds: (t: { price: number; rating: number } | null) => void;
}

export const ArbitrageRadar = ({
    products,
    hoveredProductId,
    setHoveredProductId,
    zoomDomain,
    setZoomDomain,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    thresholds,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setThresholds
}: Props) => {
    // Zoom State
    const [refAreaLeft, setRefAreaLeft] = useState<string | number | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | number | null>(null);
    const [refAreaTop, setRefAreaTop] = useState<string | number | null>(null);
    const [refAreaBottom, setRefAreaBottom] = useState<string | number | null>(null);

    // Transform data
    const data = products.map(p => ({
        x: p.price,
        y: p.rating,
        z: p.valueScore,
        name: p.name,
        link: p.link,
        id: p.link // Using link as ID for now
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

    return (
        <div className="glass-panel rounded-xl p-6 h-full flex flex-col select-none">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-off-white tracking-tight flex items-center">
                    Market Radar
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
                        <span className="w-2 h-2 rounded-full bg-indigo-accent mr-2 animate-pulse"></span>
                        High Value
                    </div>
                    <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-gray-600 mr-2"></span>
                        Standard
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
                            name="Price"
                            unit="€"
                            domain={zoomDomain ? zoomDomain.x : ['auto', 'auto']}
                            stroke="#404040"
                            tick={{ fill: '#888888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#404040' }}
                            allowDataOverflow
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Rating"
                            domain={zoomDomain ? zoomDomain.y : [0, 5]}
                            stroke="#404040"
                            tick={{ fill: '#888888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#404040' }}
                            allowDataOverflow
                        />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Score" />

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
                                                    <span className="text-2xl font-bold text-white">{data.x}€</span>
                                                    <div className="text-xs text-muted mt-1">Value Score: <span className="text-indigo-accent">{data.z.toFixed(1)}</span></div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-yellow-500 font-bold">★ {data.y}</div>
                                                    <div className="text-xs text-muted mt-1">Rating</div>
                                                </div>
                                            </div>

                                            <a
                                                href={data.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full bg-indigo-accent hover:bg-indigo-600 text-white py-2 rounded-lg font-bold text-xs tracking-wide transition-colors shadow-lg shadow-indigo-accent/20"
                                            >
                                                <ShoppingCart size={14} className="mr-2" />
                                                BUY NOW
                                            </a>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Scatter data={data} fill="#888888">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.z > 50 ? '#6366f1' : '#4b5563'}
                                    fillOpacity={hoveredProductId === entry.id ? 1 : 0.6}
                                    stroke={hoveredProductId === entry.id ? '#fff' : 'none'}
                                    strokeWidth={2}
                                    className="transition-all duration-200"
                                />
                            ))}
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
