import React, { useEffect, useRef } from 'react';
import { AmazonProduct } from '../hooks/useAmazonData';
import { ExternalLink, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    products: AmazonProduct[];
    hoveredProductId: string | null;
    setHoveredProductId: (id: string | null) => void;
}

export const ValueList = ({ products, hoveredProductId, setHoveredProductId }: Props) => {
    // Sort by Value Score (High to Low)
    const sortedProducts = [...products].sort((a, b) => b.valueScore - a.valueScore);
    const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Auto-scroll to hovered product
    useEffect(() => {
        if (hoveredProductId && rowRefs.current[hoveredProductId]) {
            rowRefs.current[hoveredProductId]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [hoveredProductId]);

    return (
        <div className="glass-panel rounded-xl p-6 h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-lg font-semibold text-off-white tracking-tight">Top Opportunities</h2>
                <span className="text-xs font-medium text-indigo-accent bg-indigo-accent/10 px-2 py-1 rounded-full">
                    {products.length} Items
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {sortedProducts.map((product, index) => {
                    const isHovered = hoveredProductId === product.link; // Using link as ID
                    return (
                        <div
                            key={index}
                            ref={el => { rowRefs.current[product.link] = el; }}
                            onMouseEnter={() => setHoveredProductId(product.link)}
                            onMouseLeave={() => setHoveredProductId(null)}
                            className={clsx(
                                "group relative p-3 rounded-lg border transition-all duration-200",
                                isHovered
                                    ? "bg-indigo-accent/10 border-indigo-accent/50 shadow-lg shadow-indigo-accent/10 scale-[1.02]"
                                    : "border-transparent hover:bg-white/5 hover:border-white/5"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-300 hover:text-indigo-accent hover:underline decoration-indigo-accent/50 underline-offset-2 line-clamp-2 leading-relaxed cursor-pointer transition-colors"
                                >
                                    {product.name}
                                </a>
                                <span className={clsx(
                                    "ml-3 flex items-center font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 transition-colors",
                                    isHovered ? "text-white bg-indigo-accent" : "text-indigo-accent bg-indigo-accent/10"
                                )}>
                                    {product.valueScore.toFixed(1)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted">
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono text-off-white select-all">{product.price}€</span>
                                    <span className="flex items-center text-yellow-500/80">
                                        ★ {product.rating}
                                    </span>
                                </div>

                                {/* Quick Action Button */}
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={clsx(
                                        "flex items-center space-x-1 bg-indigo-accent text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wide hover:bg-indigo-600 transition-all duration-200 shadow-lg shadow-indigo-accent/20 transform",
                                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                                    )}
                                >
                                    <span>BUY</span>
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                    );
                })}

                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-muted">
                        <TrendingUp size={24} className="mb-2 opacity-20" />
                        <p className="text-sm">No items match your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
