import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, ListFilter, Plus, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TelegramAlertModal } from './TelegramAlertModal';

interface NavbarProps {
  onOpenScanModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm transition-transform group-hover:scale-105">
                  S
                </div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Saaman
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/inventory"
                  className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/inventory')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  Inventory
                </Link>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-3">
              {onOpenScanModal && (
                <button
                  onClick={onOpenScanModal}
                  className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              )}

              {/* Telegram Alerts Config Button */}
              <button
                onClick={() => setIsTelegramModalOpen(true)}
                className="p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors relative"
                title="Configure Telegram Expiry Alerts"
              >
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">
                    {user?.full_name || 'Demo User'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user?.email}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* Telegram Alert Settings Modal */}
      <TelegramAlertModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
    </>
  );
};
