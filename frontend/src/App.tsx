import React, { useState, useMemo } from 'react';
import { useMarketData } from './hooks/useMarketData';
import { MarketRadar } from './components/MarketRadar';
import { FlippersTable } from './components/FlippersTable';
import { SearchBar } from './components/SearchBar';
import { FilterBar, Condition, PriceRange } from './components/FilterBar';
import { Activity, Database, TrendingUp } from 'lucide-react';

function App() {
    const { products, loading, error, stats, search } = useMarketData();

    // Filter States
    const [condition, setCondition] = useState<Condition>('ALL');
    const [priceRange, setPriceRange] = useState<PriceRange>('ALL');
    const [hideJunk, setHideJunk] = useState(false);

    // Radar States
    const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
    const [zoomDomain, setZoomDomain] = useState<{ x: [number, number]; y: [number, number] } | null>(null);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Condition Filter
            if (condition !== 'ALL') {
                const isNew = product.condition.toLowerCase().includes('neuf') || product.condition.toLowerCase().includes('new');
                if (condition === 'NEW' && !isNew) return false;
                if (condition === 'USED' && isNew) return false;
            }

            // 2. Price Range Filter
            if (priceRange === 'LOW' && product.totalPrice > 50) return false;
            if (priceRange === 'MID' && (product.totalPrice < 50 || product.totalPrice > 200)) return false;
            if (priceRange === 'HIGH' && product.totalPrice < 200) return false;

            // 3. Junk Filter (Parts/Broken)
            if (hideJunk) {
                const title = product.title.toLowerCase();
                const cond = product.condition.toLowerCase();
                if (title.includes('pièce') || title.includes('hs') || title.includes('broken') || cond.includes('pièce')) return false;
            }

            // 4. Zoom Domain Filter (Sniper Zoom)
            if (zoomDomain) {
                if (product.totalPrice < zoomDomain.y[0] || product.totalPrice > zoomDomain.y[1]) return false;
            }

            return true;
        });
    }, [products, condition, priceRange, hideJunk, zoomDomain]);

    return (
        <div className="min-h-screen bg-obsidian text-off-white font-sans selection:bg-indigo-accent/30">
            {/* Header / HUD */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-indigo-accent">
                            <Activity size={20} className="mr-2" />
                            <span className="font-bold tracking-wider text-lg">EBAY // RADAR</span>
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-4"></div>
                        <div className="flex space-x-6 text-xs font-mono text-muted">
                            <div className="flex items-center">
                                <Database size={12} className="mr-2 opacity-50" />
                                <span>ITEMS: <span className="text-off-white">{stats.totalItems}</span></span>
                            </div>
                            <div className="flex items-center">
                                <TrendingUp size={12} className="mr-2 opacity-50" />
                                <span>AVG PRICE: <span className="text-emerald-400">{stats.averagePrice.toFixed(0)}€</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="w-96">
                        <SearchBar onSearch={search} loading={loading} />
                    </div>
                </div>
            </header>

            {/* Main Content (Bento Grid) */}
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto h-screen flex flex-col">

                {/* Filter Bar */}
                <div className="mb-6 shrink-0">
                    <FilterBar
                        condition={condition}
                        setCondition={setCondition}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        hideJunk={hideJunk}
                        setHideJunk={setHideJunk}
                    />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        Error: {error}
                    </div>
                )}

                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                    {/* Radar Chart (Main View) */}
                    <div className="col-span-8 h-full min-h-0">
                        <MarketRadar
                            products={filteredProducts}
                            hoveredProductId={hoveredProductId}
                            setHoveredProductId={setHoveredProductId}
                            zoomDomain={zoomDomain}
                            setZoomDomain={setZoomDomain}
                        />
                    </div>

                    {/* Value List (Side Panel) */}
                    <div className="col-span-4 h-full min-h-0">
                        <FlippersTable
                            products={filteredProducts}
                            hoveredProductId={hoveredProductId}
                            setHoveredProductId={setHoveredProductId}
                            averagePrice={stats.averagePrice}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;