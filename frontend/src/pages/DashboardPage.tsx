import React, { useState, useEffect } from 'react';
import { Camera, Clock, AlertTriangle, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats as StatsType, Product, Category } from '../types';
import { DashboardStats, FilterStatus } from '../components/DashboardStats';
import { ProductCard } from '../components/ProductCard';
import { ImageScannerModal } from '../components/ImageScannerModal';
import { EditProductModal } from '../components/EditProductModal';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, catRes, productsRes] = await Promise.all([
        api.get<StatsType>('/dashboard'),
        api.get<Category[]>('/categories'),
        api.get<Product[]>('/products')
      ]);
      setStats(statsRes.data);
      setCategories(catRes.data);
      setAllProducts(productsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchDashboardData();
      } catch (err) {
        console.error("Failed to delete product", err);
      }
    }
  };

  // Filter products based on selected KPI card
  const filteredProducts = allProducts.filter((product) => {
    if (activeFilter === 'safe') return product.status === 'safe';
    if (activeFilter === 'expiring_soon') return product.status === 'expiring_soon';
    if (activeFilter === 'expired') return product.status === 'expired';
    return true; // 'all'
  });

  const getSectionTitle = () => {
    if (activeFilter === 'safe') return { title: 'Safe Items', icon: <CheckCircle className="w-5 h-5 text-green-600" /> };
    if (activeFilter === 'expiring_soon') return { title: 'Expiring Soon (within 30 Days)', icon: <Clock className="w-5 h-5 text-amber-600" /> };
    if (activeFilter === 'expired') return { title: 'Expired Products', icon: <AlertCircle className="w-5 h-5 text-red-600" /> };
    return { title: 'All Pantry Items', icon: <Package className="w-5 h-5 text-blue-600" /> };
  };

  const currentHeader = getSectionTitle();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pantry Inventory Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Click on any stat card below to filter your pantry products immediately.
          </p>
        </div>

        <button
          onClick={() => setIsScanModalOpen(true)}
          className="px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2 shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Product Package</span>
        </button>
      </div>

      {/* KPI Stats Cards - Interactive Filter */}
      <DashboardStats
        stats={stats}
        activeFilter={activeFilter}
        onFilterChange={(filter) => setActiveFilter(filter)}
      />

      {/* Warning Banner */}
      {stats && stats.expiring_7_days_count > 0 && activeFilter === 'all' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                {stats.expiring_7_days_count} {stats.expiring_7_days_count === 1 ? 'item expires' : 'items expire'} within 7 days!
              </h4>
              <p className="text-xs text-amber-700 font-medium">Use or consume soon to prevent waste.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveFilter('expiring_soon')}
            className="px-3 py-1.5 rounded bg-amber-600 text-white text-xs font-bold shadow hover:bg-amber-700"
          >
            Show Expiring Items
          </button>
        </div>
      )}

      {/* Filtered Products Display Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentHeader.icon}
            <h2 className="text-lg font-bold text-slate-900">{currentHeader.title} ({filteredProducts.length})</h2>
          </div>

          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Reset Filter (Show All)
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500 text-sm">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => setSelectedProductToEdit(p)}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center space-y-2 border border-slate-200">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No Items in this Filter</p>
            <p className="text-xs text-slate-500">There are currently no products matching this status.</p>
          </div>
        )}
      </section>

      {/* AI Scanner Upload Modal */}
      <ImageScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        categories={categories}
        onProductSaved={fetchDashboardData}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={selectedProductToEdit}
        categories={categories}
        onClose={() => setSelectedProductToEdit(null)}
        onUpdated={fetchDashboardData}
      />

    </div>
  );
};
