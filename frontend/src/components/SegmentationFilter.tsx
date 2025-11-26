import React from 'react';

interface SegmentationFilterProps {
    mode: 'HEAVY' | 'LIGHT';
    setMode: (mode: 'HEAVY' | 'LIGHT') => void;
}

export const SegmentationFilter: React.FC<SegmentationFilterProps> = ({ mode, setMode }) => {
    return (
        <div className="flex items-center space-x-4 bg-cyber-black border border-neon-green/30 rounded px-4 py-2">
            <span className="text-gray-400 font-mono text-xs">NOISE FILTER:</span>
            <div className="flex bg-black rounded border border-neon-green/20 p-1">
                <button
                    onClick={() => setMode('HEAVY')}
                    className={`px-4 py-1 text-xs font-mono rounded transition-all ${mode === 'HEAVY'
                            ? 'bg-neon-green text-black font-bold shadow-[0_0_10px_#00ff41]'
                            : 'text-gray-500 hover:text-white'
                        }`}
                >
                    HEAVY {'>'} 200€
                </button>
                <button
                    onClick={() => setMode('LIGHT')}
                    className={`px-4 py-1 text-xs font-mono rounded transition-all ${mode === 'LIGHT'
                            ? 'bg-neon-green text-black font-bold shadow-[0_0_10px_#00ff41]'
                            : 'text-gray-500 hover:text-white'
                        }`}
                >
                    LIGHT {'<'} 100€
                </button>
            </div>
        </div>
    );
};
