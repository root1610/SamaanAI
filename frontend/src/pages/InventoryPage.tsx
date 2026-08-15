import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, Plus, Package } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductTable } from '../components/ProductTable';
import { ImageScannerModal } from '../components/ImageScannerModal';
import { EditProductModal } from '../components/EditProductModal';

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('expiry_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort_by: sortBy,
        order: sortOrder
      };
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;

      const [prodRes, catRes] = await Promise.all([
        api.get<Product[]>('/products', { params }),
        api.get<Category[]>('/categories')
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, sortBy, sortOrder]);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Delete this item from your pantry inventory?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete product", err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-slate-600">View, search, and edit tracked pantry products</p>
        </div>

        <button
          onClick={() => setIsScanModalOpen(true)}
          className="px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product via AI
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or brand..."
              className="w-full pl-9 pr-4 py-2 rounded-md app-input text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-bold">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-1.5 rounded-md app-input text-xs font-semibold bg-white"
              >
                <option value="expiry_date-asc">Expiry Date (Earliest First)</option>
                <option value="expiry_date-desc">Expiry Date (Latest First)</option>
                <option value="name-asc">Product Name (A-Z)</option>
                <option value="created_at-desc">Recently Added</option>
              </select>
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* Product Content Display */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading inventory...</div>
      ) : products.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => setSelectedProductToEdit(p)}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={(p) => setSelectedProductToEdit(p)}
            onDelete={handleDeleteProduct}
          />
        )
      ) : (
        <div className="bg-white rounded-xl p-10 text-center space-y-2 border border-slate-200">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or filter settings.</p>
        </div>
      )}

      {/* AI Scanner Modal */}
      <ImageScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        categories={categories}
        onProductSaved={fetchProducts}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={selectedProductToEdit}
        categories={categories}
        onClose={() => setSelectedProductToEdit(null)}
        onUpdated={fetchProducts}
      />

    </div>
  );
};
