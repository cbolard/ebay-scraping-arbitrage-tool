import React from 'react';
import { Filter, Zap, Package } from 'lucide-react';
import clsx from 'clsx';

export type Condition = 'ALL' | 'NEW' | 'USED';
export type PriceRange = 'ALL' | 'LOW' | 'MID' | 'HIGH';

interface FilterBarProps {
    condition: Condition;
    setCondition: (c: Condition) => void;
    priceRange: PriceRange;
    setPriceRange: (p: PriceRange) => void;
    hideJunk: boolean;
    setHideJunk: (h: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    condition,
    setCondition,
    priceRange,
    setPriceRange,
    hideJunk,
    setHideJunk,
}) => {
    return (
        <div className="glass-panel rounded-xl p-2 flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Condition Tabs */}
            <div className="flex bg-black/20 p-1 rounded-lg">
                <button
                    onClick={() => setCondition('ALL')}
                    className={clsx(
                        'px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                        condition === 'ALL'
                            ? 'bg-indigo-accent text-white shadow-lg shadow-indigo-accent/20'
                            : 'text-muted hover:text-off-white hover:bg-white/5'
                    )}
                >
                    ALL
                </button>
                <button
                    onClick={() => setCondition('NEW')}
                    className={clsx(
                        'flex items-center px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                        condition === 'NEW'
                            ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                            : 'text-muted hover:text-emerald-400 hover:bg-white/5'
                    )}
                >
                    <Package size={12} className="mr-1.5" />
                    NEW
                </button>
                <button
                    onClick={() => setCondition('USED')}
                    className={clsx(
                        'flex items-center px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                        condition === 'USED'
                            ? 'bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/10'
                            : 'text-muted hover:text-yellow-400 hover:bg-white/5'
                    )}
                >
                    <Package size={12} className="mr-1.5" />
                    USED
                </button>
            </div>

            <div className="flex items-center space-x-6">
                {/* Price Pills */}
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted mr-2 flex items-center">
                        <Filter size={12} className="mr-1" /> Price
                    </span>
                    <button
                        onClick={() => setPriceRange(priceRange === 'LOW' ? 'ALL' : 'LOW')}
                        className={clsx(
                            'px-3 py-1 rounded-full text-xs border transition-all duration-200',
                            priceRange === 'LOW'
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                : 'bg-transparent border-white/10 text-muted hover:border-white/30'
                        )}
                    >
                        &lt; 50€
                    </button>
                    <button
                        onClick={() => setPriceRange(priceRange === 'MID' ? 'ALL' : 'MID')}
                        className={clsx(
                            'px-3 py-1 rounded-full text-xs border transition-all duration-200',
                            priceRange === 'MID'
                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                : 'bg-transparent border-white/10 text-muted hover:border-white/30'
                        )}
                    >
                        50-200€
                    </button>
                    <button
                        onClick={() => setPriceRange(priceRange === 'HIGH' ? 'ALL' : 'HIGH')}
                        className={clsx(
                            'px-3 py-1 rounded-full text-xs border transition-all duration-200',
                            priceRange === 'HIGH'
                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                : 'bg-transparent border-white/10 text-muted hover:border-white/30'
                        )}
                    >
                        &gt; 200€
                    </button>
                </div>

                {/* Junk Toggle (Maybe "Parts only" filter?) */}
                <button
                    onClick={() => setHideJunk(!hideJunk)}
                    className={clsx(
                        'flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200',
                        hideJunk
                            ? 'bg-red-500/10 border-red-500/50 text-red-400'
                            : 'bg-transparent border-white/10 text-muted hover:border-white/30'
                    )}
                >
                    <Zap size={14} className={hideJunk ? 'fill-current' : ''} />
                    <span className="text-xs font-medium">Hide Parts/Broken</span>
                </button>
            </div>
        </div>
    );
};
