import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Menu,
  Plus
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSale: () => void;
  onToggleDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSale,
  onToggleDrawer
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EBE8E2] px-3 py-1.5 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)] select-none safe-area-bottom">
      {/* 1. Visão Geral */}
      <button
        onClick={() => setActiveTab('overview')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] cursor-pointer transition-colors ${
          activeTab === 'overview' ? 'text-[#C2410C] font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">Início</span>
      </button>

      {/* 2. Vendas */}
      <button
        onClick={() => setActiveTab('sales')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] cursor-pointer transition-colors ${
          activeTab === 'sales' ? 'text-[#C2410C] font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Receipt className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">Vendas</span>
      </button>

      {/* 3. Botão Central Flutuante: + Vender */}
      <div className="flex-1 flex items-center justify-center -mt-5">
        <button
          onClick={onOpenQuickSale}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform border-2 border-white"
          title="Nova Venda Rápida"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Estoque */}
      <button
        onClick={() => setActiveTab('stock')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] cursor-pointer transition-colors ${
          activeTab === 'stock' ? 'text-[#C2410C] font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Boxes className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">Estoque</span>
      </button>

      {/* 5. Menu Gaveta Completo */}
      <button
        onClick={onToggleDrawer}
        className="flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] cursor-pointer text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">Mais</span>
      </button>
    </nav>
  );
};
