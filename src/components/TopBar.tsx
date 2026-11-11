import React from 'react';
import {
  Calendar,
  FileText,
  ShoppingCart,
  ClipboardCheck,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab, TimeFilter } from '../types';
import { useBusiness } from '../context/BusinessContext';

interface TopBarProps {
  activeTab: ActiveTab;
  onOpenExpenseModal: () => void;
  onOpenPurchaseModal: () => void;
  onOpenInventoryModal: () => void;
  onOpenCashClosureModal: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenExpenseModal,
  onOpenPurchaseModal,
  onOpenInventoryModal,
  onOpenCashClosureModal,
  onToggleMobileMenu
}) => {
  const { data, timeFilter, setTimeFilter, selectedDate, setSelectedDate } = useBusiness();

  const tabNames: Record<ActiveTab, string> = {
    overview: 'Visão Geral',
    sales: 'Vendas',
    financial: 'Financeiro',
    stock: 'Estoque',
    menu: 'Cardápio e Custos',
    purchases: 'Compras',
    reports: 'Relatórios',
    settings: 'Configurações e Backup'
  };

  return (
    <header className="h-14 bg-white border-b border-[#EBE8E2] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Canto Esquerdo: Breadcrumbs & Filtro de Período */}
      <div className="flex items-center gap-2 md:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Menu Principal"
          >
            <span className="text-base">☰</span>
          </button>
        )}

        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-800 font-semibold">{data.settings.businessName}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">{tabNames[activeTab]}</span>
        </div>

        {/* Separador vertical sutil */}
        <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />

        {/* Filtros de Data/Período */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setTimeFilter('hoje')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              timeFilter === 'hoje'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setTimeFilter('ontem')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              timeFilter === 'ontem'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ontem
          </button>
          <button
            onClick={() => setTimeFilter('mes')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              timeFilter === 'mes'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setTimeFilter('tudo')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              timeFilter === 'tudo'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tudo
          </button>

          {/* Campo de Data */}
          <div className="flex items-center gap-1.5 pl-2 pr-1 border-l border-slate-200">
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setTimeFilter('data');
              }}
              className="text-xs font-mono font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Canto Direito: Botões de Ação do Topo (Exibidos em telas médias/grandes) */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Lançar Despesa</span>
        </button>

        <button
          onClick={onOpenPurchaseModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
          <span>Registrar Compra</span>
        </button>

        <button
          onClick={onOpenInventoryModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Contagem</span>
        </button>

        <button
          onClick={onOpenCashClosureModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FCD9B3] bg-[#FFF8F0] hover:bg-[#FEEAD2] text-[#C2410C] text-xs font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Fechamento Caixa</span>
        </button>
      </div>
    </header>
  );
};
