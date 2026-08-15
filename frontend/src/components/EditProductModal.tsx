import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';

interface EditProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onUpdated: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  categories,
  onClose,
  onUpdated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category_id: 1,
    expiry_date: '',
    mfd_date: '',
    quantity: 1,
    unit: 'pcs',
    batch_number: '',
    notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand || '',
        category_id: product.category_id || 1,
        expiry_date: product.expiry_date,
        mfd_date: product.mfd_date || '',
        quantity: product.quantity,
        unit: product.unit || 'pcs',
        batch_number: product.batch_number || '',
        notes: product.notes || ''
      });
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await api.put(`/products/${product.id}`, {
        name: formData.name,
        brand: formData.brand || null,
        category_id: Number(formData.category_id),
        expiry_date: formData.expiry_date,
        mfd_date: formData.mfd_date || null,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        batch_number: formData.batch_number || null,
        notes: formData.notes || null
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update product details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
        
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit Product</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md app-input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-md app-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-md app-input text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-amber-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 rounded-md app-input text-sm font-mono border-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mfg Date</label>
              <input
                type="date"
                value={formData.mfd_date}
                onChange={(e) => setFormData({ ...formData, mfd_date: e.target.value })}
                className="w-full px-3 py-2 rounded-md app-input text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qty</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-2.5 py-2 rounded-md app-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-2.5 py-2 rounded-md app-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch #</label>
              <input
                type="text"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                className="w-full px-2.5 py-2 rounded-md app-input text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-md app-input text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </form>

      </div>
    </div>
  );
};
