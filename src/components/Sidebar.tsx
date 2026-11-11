import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Boxes,
  UtensilsCrossed,
  Truck,
  BarChart3,
  Settings,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useBusiness } from '../context/BusinessContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSale: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSale
}) => {
  const { data } = useBusiness();

  // Itens sem contagem inicial
  const uncountedCount = data.stockItems.filter(
    item => !item.isCounted || item.currentQuantity === null
  ).length;

  const menuItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas', icon: Receipt },
    { id: 'financial', label: 'Financeiro', icon: Wallet },
    {
      id: 'stock',
      label: 'Estoque',
      icon: Boxes,
      badge: uncountedCount > 0 ? `${uncountedCount} s/ contagem` : undefined
    },
    { id: 'menu', label: 'Cardápio e Custos', icon: UtensilsCrossed },
    { id: 'purchases', label: 'Compras', icon: Truck },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações e Backup', icon: Settings }
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#EBE8E2] flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      <div className="p-4 space-y-4">
        {/* Marca do Estabelecimento */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] flex items-center justify-center text-white shadow-xs font-bold text-lg">
            🍦
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">
              {data.settings.businessName || 'Cantinho Gelado'}
            </h1>
            <span className="text-[10px] font-extrabold tracking-wider text-amber-800 uppercase block leading-tight">
              BUSINESS CORE
            </span>
          </div>
        </div>

        {/* Botão Mestre Terracota: Registrar Venda */}
        <button
          onClick={onOpenQuickSale}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#C2410C] hover:bg-[#B43A08] active:bg-[#9A3412] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>Registrar Venda</span>
        </button>

        {/* Menu de Navegação Vertical */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#FDF6ED] text-[#C2410C] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#C2410C]' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold text-[#C2410C] bg-[#FEEAD2] px-2 py-0.5 rounded-md border border-[#FCD9B3]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Operação Local-First */}
      <div className="p-4 border-t border-[#F0ECE4] bg-white">
        <div className="flex items-start gap-2.5 text-xs">
          <div className="text-emerald-600 mt-0.5">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-[11px]">
              Operação Local-First
            </span>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Sem dependência de internet ou IA. Cálculos matemáticos determinísticos.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
