import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export interface AmazonProduct {
    name: string;
    rating: number;
    price: number;
    sales: string;
    link: string;
    status: string;
    valueScore: number;
}

export interface AmazonData {
    products: AmazonProduct[];
    loading: boolean;
    error: string | null;
    stats: {
        marketCeiling: number;
        marketFloor: number;
        signalIntegrity: number;
        totalItems: number;
    };
}

interface UseAmazonDataReturn extends AmazonData {
    search: (query: string) => Promise<void>;
}

export const useAmazonData = (): UseAmazonDataReturn => {
    const [data, setData] = useState<AmazonData>({
        products: [],
        loading: true,
        error: null,
        stats: {
            marketCeiling: 0,
            marketFloor: 0,
            signalIntegrity: 0,
            totalItems: 0,
        },
    });

    const processCsvData = (csvText: string) => {
        Papa.parse(csvText, {
            header: true,
            complete: (results) => {
                const parsedProducts: AmazonProduct[] = [];
                let validPrices = 0;
                let maxPrice = 0;
                let minPriceHighRated = Infinity;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results.data.forEach((row: any) => {
                    // Clean and parse Price
                    let price = 0;
                    if (row['Prix']) {
                        const priceStr = row['Prix'].toString().replace(/[^\d.,]/g, '').replace(',', '.');
                        price = parseFloat(priceStr) || 0;
                    }

                    // Clean and parse Rating
                    let rating = 0;
                    if (row['Note']) {
                        const ratingStr = row['Note'].toString().replace(/[^\d.,]/g, '').replace(',', '.');
                        rating = parseFloat(ratingStr) || 0;
                    }

                    // Calculate Value Score: (Note^2 * 10) / Price
                    let valueScore = 0;
                    if (price > 0) {
                        valueScore = (Math.pow(rating, 2) * 10) / price;
                    }

                    // Update Stats
                    if (price > 0) {
                        validPrices++;
                        if (price > maxPrice) maxPrice = price;
                        if (rating >= 4.0 && price < minPriceHighRated) minPriceHighRated = price;
                    }

                    parsedProducts.push({
                        name: row['Nom du Produit'] || 'Unknown',
                        rating: rating,
                        price: price,
                        sales: row['Ventes'] || '0',
                        link: row['Lien'] || '#',
                        status: row['Statut'] || 'Unknown',
                        valueScore: valueScore,
                    });
                });

                // Calculate Signal Integrity
                const signalIntegrity = results.data.length > 0
                    ? (validPrices / results.data.length) * 100
                    : 0;

                setData({
                    products: parsedProducts,
                    loading: false,
                    error: null,
                    stats: {
                        marketCeiling: maxPrice,
                        marketFloor: minPriceHighRated === Infinity ? 0 : minPriceHighRated,
                        signalIntegrity: signalIntegrity,
                        totalItems: parsedProducts.length,
                    },
                });
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (err: any) => {
                setData((prev) => ({ ...prev, loading: false, error: err.message }));
            },
        });
    };

    const fetchData = async () => {
        try {
            const response = await fetch('/data.csv');
            if (!response.ok) {
                // If data.csv doesn't exist yet (first run), just stop loading
                if (response.status === 404) {
                    setData(prev => ({ ...prev, loading: false }));
                    return;
                }
                throw new Error('Failed to fetch data');
            }
            const csvText = await response.text();
            processCsvData(csvText);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setData((prev) => ({ ...prev, loading: false, error: errorMessage }));
        }
    };

    const search = async (query: string) => {
        setData(prev => ({ ...prev, loading: true, error: null }));
        try {
            const searchUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(query)}`;

            const response = await fetch('http://localhost:5000/generate-csv', {
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

            const csvBlob = await response.blob();
            const csvText = await csvBlob.text();
            processCsvData(csvText);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Search failed';
            setData(prev => ({ ...prev, loading: false, error: errorMessage }));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { ...data, search };
};

