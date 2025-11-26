import React, { useEffect, useRef } from 'react';
import { MarketProduct } from '../hooks/useMarketData';
import { ExternalLink, TrendingUp, Package, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    products: MarketProduct[];
    hoveredProductId: string | null;
    setHoveredProductId: (id: string | null) => void;
    averagePrice: number;
}

export const FlippersTable = ({ products, hoveredProductId, setHoveredProductId, averagePrice }: Props) => {
    // Sort by Date (Newest first) by default
    // Or maybe by "Deal Quality" (Price vs Average)?
    // Let's sort by Date for now as it's a "Feed"
    // Actually, user might want cheapest first. Let's do Price Ascending for "Arbitrage"
    const sortedProducts = [...products].sort((a, b) => a.totalPrice - b.totalPrice);

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
                <h2 className="text-lg font-semibold text-off-white tracking-tight">Live Feed</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted">Avg: {averagePrice.toFixed(0)}€</span>
                    <span className="text-xs font-medium text-indigo-accent bg-indigo-accent/10 px-2 py-1 rounded-full">
                        {products.length} Items
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {sortedProducts.map((product, index) => {
                    const isHovered = hoveredProductId === product.link;
                    const isGoodDeal = product.totalPrice < averagePrice * 0.8; // 20% below average
                    const isNew = product.condition.toLowerCase().includes('neuf') || product.condition.toLowerCase().includes('new');

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
                                    : "border-transparent hover:bg-white/5 hover:border-white/5",
                                isGoodDeal && !isHovered ? "border-emerald-500/30 bg-emerald-500/5" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-300 hover:text-indigo-accent hover:underline decoration-indigo-accent/50 underline-offset-2 line-clamp-2 leading-relaxed cursor-pointer transition-colors"
                                >
                                    {product.title}
                                </a>
                                <div className="flex flex-col items-end ml-3 shrink-0">
                                    <span className={clsx(
                                        "font-mono text-sm font-bold px-1.5 py-0.5 rounded transition-colors",
                                        isGoodDeal ? "text-emerald-400" : "text-off-white"
                                    )}>
                                        {product.totalPrice.toFixed(0)}€
                                    </span>
                                    {product.shipping > 0 && (
                                        <span className="text-[10px] text-muted">
                                            +{product.shipping.toFixed(0)}€ ship
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted mt-2">
                                <div className="flex items-center space-x-3">
                                    <span className={clsx(
                                        "flex items-center",
                                        isNew ? "text-emerald-400" : "text-yellow-500/80"
                                    )}>
                                        <Package size={10} className="mr-1" />
                                        {product.condition}
                                    </span>
                                    <span className="flex items-center text-gray-500">
                                        <Calendar size={10} className="mr-1" />
                                        {product.date}
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
                                    <span>VIEW</span>
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
