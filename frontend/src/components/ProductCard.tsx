import React from 'react';
import { Calendar, Edit, Trash2, Tag } from 'lucide-react';
import { Product } from '../types';
import { ExpiryBadge } from './ExpiryBadge';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Top Section */}
        <div className="p-4 pb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            {product.brand && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                {product.brand}
              </span>
            )}
            <h3 className="font-bold text-slate-900 text-base leading-snug">
              {product.name}
            </h3>
          </div>

          <div className="shrink-0">
            <ExpiryBadge status={product.status} daysLeft={product.days_until_expiry} expiryDate={product.expiry_date} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Exp: <strong className="font-mono text-slate-900">{product.expiry_date}</strong></span>
          </div>

          {product.mfd_date && (
            <div className="text-slate-600 font-medium text-right">
              <span>Mfg: <strong className="font-mono text-slate-800">{product.mfd_date}</strong></span>
            </div>
          )}
        </div>

        {/* Category & Quantity Pills */}
        <div className="p-4 pt-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
            <Tag className="w-3 h-3 text-blue-600" />
            <span>{product.category?.name || 'General'}</span>
          </div>

          <div className="font-bold text-slate-700">
            Qty: {product.quantity} {product.unit || 'pcs'}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 font-mono">
          {product.ocr_confidence !== undefined && product.ocr_confidence !== null ? `OCR: ${Math.round(product.ocr_confidence * 100)}%` : ''}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Item"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
