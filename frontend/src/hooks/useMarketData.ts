import { useState, useEffect } from 'react';

export interface MarketProduct {
    title: string;
    price: number;
    shipping: number;
    totalPrice: number;
    date: string;
    condition: string;
    link: string;
    image: string;
}

export interface MarketData {
    products: MarketProduct[];
    loading: boolean;
    error: string | null;
    stats: {
        averagePrice: number;
        minPrice: number;
        maxPrice: number;
        totalItems: number;
    };
}

interface UseMarketDataReturn extends MarketData {
    search: (query: string) => Promise<void>;
}

export const useMarketData = (): UseMarketDataReturn => {
    const [data, setData] = useState<MarketData>({
        products: [],
        loading: false, // Start false, wait for user search
        error: null,
        stats: {
            averagePrice: 0,
            minPrice: 0,
            maxPrice: 0,
            totalItems: 0,
        },
    });

    const search = async (query: string) => {
        setData(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Construct eBay Sold Listings URL
            const searchUrl = `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`;

            const response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: searchUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Search failed');
            }

            const products: MarketProduct[] = await response.json();

            // Calculate stats
            let totalPriceSum = 0;
            let minPrice = Infinity;
            let maxPrice = 0;

            products.forEach(p => {
                totalPriceSum += p.totalPrice;
                if (p.totalPrice < minPrice) minPrice = p.totalPrice;
                if (p.totalPrice > maxPrice) maxPrice = p.totalPrice;
            });

            const averagePrice = products.length > 0 ? totalPriceSum / products.length : 0;

            setData({
                products,
                loading: false,
                error: null,
                stats: {
                    averagePrice,
                    minPrice: minPrice === Infinity ? 0 : minPrice,
                    maxPrice,
                    totalItems: products.length,
                },
            });

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Search failed';
            setData(prev => ({ ...prev, loading: false, error: errorMessage }));
        }
    };

    return { ...data, search };
};
