import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { ExpiryBadge } from './ExpiryBadge';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="app-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-800">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 font-bold">Product</th>
              <th className="px-6 py-3.5 font-bold">Category</th>
              <th className="px-6 py-3.5 font-bold">Status</th>
              <th className="px-6 py-3.5 font-bold">Expiry Date</th>
              <th className="px-6 py-3.5 font-bold">Quantity</th>
              <th className="px-6 py-3.5 font-bold">Batch #</th>
              <th className="px-6 py-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="font-bold text-slate-900">{product.name}</div>
                  {product.brand && <div className="text-xs text-blue-600 font-semibold">{product.brand}</div>}
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {product.category?.name || 'General'}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <ExpiryBadge
                    status={product.status}
                    daysLeft={product.days_until_expiry}
                    expiryDate={product.expiry_date}
                  />
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-slate-700 font-semibold">
                  {product.expiry_date}
                </td>
                <td className="px-6 py-3.5 font-bold text-slate-800">
                  {product.quantity} {product.unit}
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                  {product.batch_number || 'N/A'}
                </td>
                <td className="px-6 py-3.5 text-right space-x-1">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
