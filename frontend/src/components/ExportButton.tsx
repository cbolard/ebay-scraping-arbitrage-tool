import React from 'react';
import { Download } from 'lucide-react';
import { MarketProduct } from '../hooks/useMarketData';
import Papa from 'papaparse';

interface ExportButtonProps {
    products: MarketProduct[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ products }) => {
    const handleExport = () => {
        if (products.length === 0) return;

        // Transform data for export if needed (e.g., rename headers)
        const exportData = products.map(p => ({
            Titre: p.title,
            Prix: p.price,
            Livraison: p.shipping,
            Total: p.totalPrice,
            Date: p.date,
            Etat: p.condition,
            Lien: p.link,
            Image: p.image
        }));

        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ebay-search-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            disabled={products.length === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-off-white hover:bg-white/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download size={16} />
            <span>Export CSV</span>
        </button>
    );
};
