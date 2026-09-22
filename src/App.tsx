/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Profile, 
  Product, 
  Category, 
  Transaction, 
  UserRole 
} from './types/database';
import { dbService } from './lib/supabaseClient';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { RouteGuardBanner } from './components/RouteGuardBanner';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginView } from './views/LoginView';
import { PosView } from './views/PosView';
import { StockView } from './views/StockView';
import { DashboardView } from './views/DashboardView';
import { ProductManagementView } from './views/ProductManagementView';
import { StockInView } from './views/StockInView';
import { SalesReportView } from './views/SalesReportView';
import { UserManagementView } from './views/UserManagementView';
import { SqlGuideView } from './views/SqlGuideView';
import { 
  ShoppingCart, 
  Package, 
  LayoutDashboard, 
  FileText, 
  Code2,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => dbService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedReceiptTrx, setSelectedReceiptTrx] = useState<Transaction | null>(null);
  const [productForRestock, setProductForRestock] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync data dari database / local state
  const refreshData = useCallback(() => {
    const prods = dbService.getProducts();
    const cats = dbService.getCategories();
    const trxs = dbService.getTransactions();
    const profs = dbService.getProfiles();
    const user = dbService.getCurrentUser();

    setProducts(prods);
    setCategories(cats);
    setTransactions(trxs);
    setProfiles(profs);
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Role Switch (Quick switch for testing RBAC)
  const handleRoleSwitch = (newRole: UserRole) => {
    const updated = dbService.switchRole(newRole);
    setCurrentUser(updated);
    refreshData();
  };

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
  };

  const handleOpenRestock = (product: Product) => {
    setProductForRestock(product);
    setCurrentTab('stock-in');
  };

  // If user is not logged in, show the clean login page
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(profile) => {
          setCurrentUser(profile);
          refreshData();
        }}
      />
    );
  }

  // RBAC Route Guard Check:
  // Petugas is strictly restricted to 'pos', 'stock', and 'sql-guide'
  const isPetugas = currentUser.role === 'petugas';
  const isAdminOnlyTab = [
    'dashboard',
    'products',
    'stock-in',
    'reports',
    'users',
  ].includes(currentTab);

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.min_stock
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
        onRefreshData={refreshData}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          userRole={currentUser.role}
          lowStockCount={lowStockCount}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 pb-16 md:pb-6">
          {/* If route is restricted for Petugas, display RBAC Guard */}
          {isPetugas && isAdminOnlyTab ? (
            <RouteGuardBanner
              requiredRole="admin"
              currentRole={currentUser.role}
              onSwitchToAdmin={() => handleRoleSwitch('admin')}
              onBackToPos={() => setCurrentTab('pos')}
            />
          ) : (
            <>
              {currentTab === 'pos' && (
                <PosView
                  products={products}
                  categories={categories}
                  onRefreshData={refreshData}
                />
              )}

              {currentTab === 'stock' && (
                <StockView
                  products={products}
                  categories={categories}
                  userRole={currentUser.role}
                  onOpenRestock={handleOpenRestock}
                />
              )}

              {currentTab === 'dashboard' && (
                <DashboardView
                  products={products}
                  transactions={transactions}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onSelectTransaction={(trx) => setSelectedReceiptTrx(trx)}
                  onOpenRestock={handleOpenRestock}
                />
              )}

              {currentTab === 'products' && (
                <ProductManagementView
                  products={products}
                  categories={categories}
                  onRefreshData={refreshData}
                />
              )}

              {currentTab === 'stock-in' && (
                <StockInView
                  products={products}
                  selectedProduct={productForRestock}
                  onRefreshData={refreshData}
                />
              )}

              {currentTab === 'reports' && (
                <SalesReportView
                  transactions={transactions}
                  onSelectTransaction={(trx) => setSelectedReceiptTrx(trx)}
                />
              )}

              {currentTab === 'users' && (
                <UserManagementView
                  profiles={profiles}
                  currentUserId={currentUser.id}
                  onRefreshData={refreshData}
                />
              )}

              {currentTab === 'sql-guide' && <SqlGuideView />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentTab('pos')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            currentTab === 'pos' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mb-0.5" />
          <span>Kasir POS</span>
        </button>

        <button
          onClick={() => setCurrentTab('stock')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            currentTab === 'stock' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Stok</span>
        </button>

        {!isPetugas && (
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
              currentTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Dashboard</span>
          </button>
        )}

        {!isPetugas && (
          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
              currentTab === 'reports' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span>Laporan</span>
          </button>
        )}

        <button
          onClick={() => setCurrentTab('sql-guide')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            currentTab === 'sql-guide' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Code2 className="w-4 h-4 mb-0.5" />
          <span>SQL &amp; Next</span>
        </button>
      </div>

      {/* Global Receipt Inspection Modal */}
      {selectedReceiptTrx && (
        <ReceiptModal
          transaction={selectedReceiptTrx}
          onClose={() => setSelectedReceiptTrx(null)}
          onNewTransaction={() => {
            setSelectedReceiptTrx(null);
            setCurrentTab('pos');
          }}
        />
      )}
    </div>
  );
}
