import React from 'react';
import { Package, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardStats as StatsType } from '../types';

export type FilterStatus = 'all' | 'safe' | 'expiring_soon' | 'expired';

interface DashboardStatsProps {
  stats: StatsType | null;
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, activeFilter, onFilterChange }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Items */}
      <button
        onClick={() => onFilterChange('all')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'all'
            ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-600/20'
            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Items</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">
          {stats ? stats.total_products : '—'}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Click to view all items</p>
      </button>

      {/* Safe Products */}
      <button
        onClick={() => onFilterChange('safe')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'safe'
            ? 'bg-green-50/50 border-green-600 shadow-md ring-2 ring-green-600/20'
            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Safe Items</span>
          <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">
          {stats ? stats.safe_count : '—'}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Click to view safe items</p>
      </button>

      {/* Expiring Soon */}
      <button
        onClick={() => onFilterChange('expiring_soon')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'expiring_soon'
            ? 'bg-amber-50/50 border-amber-600 shadow-md ring-2 ring-amber-600/20'
            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Expiring Soon</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-600 mt-2">
          {stats ? stats.expiring_7_days_count : '—'}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Click to view expiring items</p>
      </button>

      {/* Expired Products */}
      <button
        onClick={() => onFilterChange('expired')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === 'expired'
            ? 'bg-red-50/50 border-red-600 shadow-md ring-2 ring-red-600/20'
            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Expired</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-red-600 mt-2">
          {stats ? stats.expired_count : '—'}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Click to view expired items</p>
      </button>

    </div>
  );
};
