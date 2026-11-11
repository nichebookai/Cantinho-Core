/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BusinessProvider } from './context/BusinessContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewPage } from './pages/OverviewPage';
import { SalesPage } from './pages/SalesPage';
import { FinancialPage } from './pages/FinancialPage';
import { StockPage } from './pages/StockPage';
import { MenuAndCostsPage } from './pages/MenuAndCostsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuickSaleModal } from './components/QuickSaleModal';
import { CashClosureModal } from './components/CashClosureModal';
import { BottomNav } from './components/BottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { ActiveTab } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modais globais
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isCashClosureOpen, setIsCashClosureOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Navegação direta com modal
  const handleOpenExpense = () => {
    setActiveTab('financial');
  };

  const handleOpenPurchase = () => {
    setActiveTab('purchases');
  };

  const handleOpenInventory = () => {
    setActiveTab('stock');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-slate-800 flex antialiased">
      {/* Barra Lateral Esquerda Fixa (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSale={() => setIsQuickSaleOpen(true)}
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior com Breadcrumbs e Filtros de Período */}
        <TopBar
          activeTab={activeTab}
          onOpenExpenseModal={handleOpenExpense}
          onOpenPurchaseModal={handleOpenPurchase}
          onOpenInventoryModal={handleOpenInventory}
          onOpenCashClosureModal={() => setIsCashClosureOpen(true)}
          onToggleMobileMenu={() => setIsDrawerOpen(true)}
        />

        {/* View da Tela Ativa */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto max-w-[1600px] w-full">
          {activeTab === 'overview' && (
            <OverviewPage
              setActiveTab={setActiveTab}
              onOpenQuickSale={() => setIsQuickSaleOpen(true)}
              onOpenInventory={handleOpenInventory}
            />
          )}

          {activeTab === 'sales' && <SalesPage />}

          {activeTab === 'financial' && (
            <FinancialPage onOpenCashClosure={() => setIsCashClosureOpen(true)} />
          )}

          {activeTab === 'stock' && <StockPage />}

          {activeTab === 'menu' && <MenuAndCostsPage />}

          {activeTab === 'purchases' && <PurchasesPage />}

          {activeTab === 'reports' && <ReportsPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Navegação Mobile Inferior Fixa */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSale={() => setIsQuickSaleOpen(true)}
        onToggleDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Menu Gaveta Mobile Completo */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSale={() => setIsQuickSaleOpen(true)}
        onOpenExpenseModal={handleOpenExpense}
        onOpenPurchaseModal={handleOpenPurchase}
        onOpenInventoryModal={handleOpenInventory}
        onOpenCashClosureModal={() => setIsCashClosureOpen(true)}
      />

      {/* Modal Mestre: Registrar Venda Rápida */}
      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        onClose={() => setIsQuickSaleOpen(false)}
      />

      {/* Modal Mestre: Fechamento de Caixa Diário */}
      <CashClosureModal
        isOpen={isCashClosureOpen}
        onClose={() => setIsCashClosureOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BusinessProvider>
      <MainApp />
    </BusinessProvider>
  );
}
