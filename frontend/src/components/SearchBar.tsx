import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    loading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`h-5 w-5 ${loading ? 'text-indigo-accent animate-pulse' : 'text-muted group-focus-within:text-white'} transition-colors duration-200`} />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-12 py-3 bg-glass-bg border border-glass-border rounded-xl text-off-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-accent/50 focus:border-indigo-accent/50 transition-all duration-200 backdrop-blur-md"
                    placeholder="Search Amazon (e.g., 'RTX 4070', 'Lego Star Wars')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-medium text-muted bg-white/5 rounded border border-white/10">
                        ⌘K
                    </kbd>
                </div>
            </div>
        </form>
    );
};
