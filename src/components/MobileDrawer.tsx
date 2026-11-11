import React from 'react';
import {
  X,
  LayoutDashboard,
  Receipt,
  Wallet,
  Boxes,
  UtensilsCrossed,
  Truck,
  BarChart3,
  Settings,
  Database,
  FileText,
  ShoppingCart,
  ClipboardCheck,
  ArrowLeftRight
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useBusiness } from '../context/BusinessContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSale: () => void;
  onOpenExpenseModal: () => void;
  onOpenPurchaseModal: () => void;
  onOpenInventoryModal: () => void;
  onOpenCashClosureModal: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenQuickSale,
  onOpenExpenseModal,
  onOpenPurchaseModal,
  onOpenInventoryModal,
  onOpenCashClosureModal
}) => {
  const { data } = useBusiness();

  if (!isOpen) return null;

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
    { id: 'reports', label: 'Relatórios (DRE)', icon: BarChart3 },
    { id: 'settings', label: 'Configurações e Backup', icon: Settings }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Conteúdo da Gaveta */}
      <div className="relative w-4/5 max-w-xs bg-white h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Topo com Marca e Botão Fechar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
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

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botão Mestre: Registrar Venda */}
          <button
            onClick={() => {
              onClose();
              onOpenQuickSale();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#C2410C] hover:bg-[#B43A08] active:bg-[#9A3412] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Registrar Venda</span>
          </button>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onClose();
                onOpenExpenseModal();
              }}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-semibold"
            >
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] leading-tight">Lançar Despesa</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPurchaseModal();
              }}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-semibold"
            >
              <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] leading-tight">Nova Compra</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInventoryModal();
              }}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-semibold"
            >
              <ClipboardCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] leading-tight">Contagem</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCashClosureModal();
              }}
              className="p-2.5 bg-[#FFF8F0] border border-[#FCD9B3] rounded-xl text-left hover:bg-[#FEEAD2] flex items-center gap-2 text-[#C2410C] font-semibold"
            >
              <ArrowLeftRight className="w-4 h-4 shrink-0" />
              <span className="text-[11px] leading-tight">Fechar Caixa</span>
            </button>
          </div>

          {/* Lista de Navegação (8 seções) */}
          <nav className="space-y-1 pt-2 border-t border-slate-100">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#FDF6ED] text-[#C2410C] font-bold'
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

        {/* Rodapé da Gaveta */}
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
                Cálculos determinísticos e armazenamento 100% no seu dispositivo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
