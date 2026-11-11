import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  DollarSign,
  BookOpen,
  Truck,
  Settings,
  Sparkles,
  Lock
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/deterministicMath';

export type ActiveTab =
  | 'overview'
  | 'sales'
  | 'stock'
  | 'financial'
  | 'menu'
  | 'purchases'
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCashClosure: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCashClosure
}) => {
  const { data, summary } = useBusiness();

  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'sales' as ActiveTab, label: 'PDV Balcão', icon: ShoppingCart },
    { id: 'stock' as ActiveTab, label: 'Estoque', icon: Boxes },
    { id: 'financial' as ActiveTab, label: 'Financeiro', icon: DollarSign },
    { id: 'menu' as ActiveTab, label: 'Cardápio & Custos', icon: BookOpen },
    { id: 'purchases' as ActiveTab, label: 'Compras', icon: Truck },
    { id: 'settings' as ActiveTab, label: 'Configurações', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-amber-900/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zona 1: Marca do Estabelecimento */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-50" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                {data.settings.businessName || 'Cantinho Gelado'}
              </span>
              <span className="text-[11px] font-medium text-amber-800/70 block leading-tight">
                Cantinho Gelado · Offline-First
              </span>
            </div>
          </div>

          {/* Zona 2: Links de Navegação */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-100/80 text-amber-950 font-semibold shadow-xs border border-amber-300/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zona 3: Ação Principal & Gaveta de Caixa */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Gaveta Física
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 tabular-nums">
                {formatCurrency(summary.currentDrawerCash)}
              </span>
            </div>

            <button
              onClick={onOpenCashClosure}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="Conferir gaveta e realizar fechamento diário"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Fechar Caixa</span>
            </button>
          </div>
        </div>

        {/* Barra de navegação secundária em telas menores */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 pt-1 border-t border-amber-900/5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
