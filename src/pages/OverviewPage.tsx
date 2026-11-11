import React from 'react';
import {
  Calendar,
  Wallet,
  Receipt,
  TrendingUp,
  FileText,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency, formatPercentage } from '../utils/deterministicMath';
import { ActiveTab } from '../types';

interface OverviewPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSale: () => void;
  onOpenInventory: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  setActiveTab,
  onOpenQuickSale,
  onOpenInventory
}) => {
  const { summary, data, selectedDate } = useBusiness();

  // Formatação da data para o cabeçalho (ex: Dia 11/11/2026)
  const displayDate = selectedDate
    ? selectedDate.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');

  // Produtos mais vendidos determinísticos
  const productSalesMap = new Map<
    string,
    { name: string; category: string; count: number; revenue: number }
  >();

  data.sales
    .filter(s => s.status === 'completed')
    .forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSalesMap.get(item.productId) || {
          name: item.productName,
          category: item.category,
          count: 0,
          revenue: 0
        };
        existing.count += item.quantity;
        existing.revenue += item.totalPrice;
        productSalesMap.set(item.productId, existing);
      });
    });

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Alertas
  const uncountedItems = data.stockItems.filter(item => !item.isCounted || item.currentQuantity === null);
  const incompleteCostProducts = data.products.filter(
    p => p.directUnitCost === null || p.costStatus === 'incomplete'
  );
  const lowStockItems = data.stockItems.filter(
    item => item.isCounted && item.currentQuantity !== null && item.currentQuantity <= item.minStock
  );

  return (
    <div className="space-y-5">
      {/* Banner Resumo Operacional */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
            <Calendar className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Resumo Operacional · Dia {displayDate}{' '}
              <span className="text-slate-500 font-normal">
                ({summary.salesCount} {summary.salesCount === 1 ? 'venda realizada' : 'vendas realizadas'})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Todas as métricas são calculadas por fórmulas determinísticas sobre os registros do período.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickSale}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Venda</span>
        </button>
      </div>

      {/* Faixa de 5 Cards de Métricas (Fiel ao Print 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Caixa Total Atual */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700">Caixa Total Atual</span>
              <Wallet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5 tabular-nums">
              {formatCurrency(summary.totalCashBalance)}
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-emerald-700 font-semibold">
              +{formatCurrency(summary.totalPaidInflows)}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-semibold">
              -{formatCurrency(summary.totalPaidOutflows)}
            </span>
          </div>
        </div>

        {/* Card 2: Vendas Líquidas */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700">Vendas Líquidas</span>
              <Receipt className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5 tabular-nums">
              {formatCurrency(summary.netSales)}
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Bruto: {formatCurrency(summary.grossSales)}
          </div>
        </div>

        {/* Card 3: Lucro Bruto & Margem */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700">Lucro Bruto & Margem</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(summary.grossProfit)}
              </span>
              <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {formatPercentage(summary.grossMarginPercent)}
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
            CMV Apurado: {formatCurrency(summary.cmv)}
          </div>
        </div>

        {/* Card 4: Despesas Lançadas */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700">Despesas Lançadas</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5 tabular-nums">
              {formatCurrency(summary.totalOperatingExpenses)}
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Pagas: {formatCurrency(summary.paidOperatingExpenses)}
          </div>
        </div>

        {/* Card 5: Lucro Líquido Estimado */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700">Lucro Líquido Estimado</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(summary.netProfit)}
              </span>
              <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {formatPercentage(summary.netProfitMarginPercent)}
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Fórmula: Lucro Bruto - Despesas
          </div>
        </div>
      </div>

      {/* Seção Inferior de 3 Colunas (Fiel ao Print 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Coluna 1: FLUXO DE CAIXA (FINANCEIRO EFETIVO) */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Fluxo de Caixa (Financeiro Efetivo)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Entradas e saídas reais de dinheiro no período (não confundir com lucro)
            </p>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="text-emerald-600">↗</span> Entradas Efetivas Recebidas:
                </span>
                <span className="font-mono font-bold text-emerald-700 tabular-nums">
                  +{formatCurrency(summary.periodInflows)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="text-rose-600">↘</span> Saídas Efetivas Pagas:
                </span>
                <span className="font-mono font-bold text-rose-700 tabular-nums">
                  -{formatCurrency(summary.periodOutflows)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">Resultado Financeiro do Período:</span>
                <span className="font-mono font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(summary.periodNetResult)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Saldo Atual Acumulado em Caixa:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {formatCurrency(summary.totalCashBalance)}
            </span>
          </div>
        </div>

        {/* Coluna 2: PRODUTOS MAIS VENDIDOS */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                  Produtos Mais Vendidos
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Classificação por volume de saída
                </p>
              </div>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs font-semibold text-[#C2410C] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ver Vendas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-8 flex-1 flex flex-col justify-center">
              {topProducts.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8">
                  Nenhuma venda registrada no período selecionado.
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-900 block truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.category}</span>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-900">
                        {p.count} un
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-right mt-6">
            Preços congelados no momento da venda
          </div>
        </div>

        {/* Coluna 3: ALERTAS E DADOS PENDENTES */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>ALERTAS E DADOS PENDENTES</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-900 bg-[#FEEAD2] px-2 py-0.5 rounded-md border border-[#FCD9B3]">
              Princípio 4: Sem números inventados
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Box 1: Sem contagem inicial */}
            <div className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">
                  {uncountedItems.length} itens sem contagem inicial
                </span>
                <button
                  onClick={onOpenInventory}
                  className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  Contar agora
                </button>
              </div>
              <p className="text-[11px] text-rose-800 leading-tight">
                Quantidades permanecem como &quot;Não contado&quot; até serem inventariadas.
              </p>
            </div>

            {/* Box 2: Dados pendentes */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950">
                  {incompleteCostProducts.length} itens com dados pendentes
                </span>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Ver cardápio
                </button>
              </div>
              <p className="text-[11px] text-amber-900 leading-tight">
                Ex: Sorvete, calda ou embalagem sem custo cadastrado. O sistema não estima custos silenciosamente.
              </p>
            </div>

            {/* Box 3: Estoque baixo/crítico */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 block">
                {lowStockItems.length} itens com estoque baixo/crítico
              </span>
              <p className="text-[11px] text-slate-600 leading-tight">
                {lowStockItems.length > 0
                  ? lowStockItems.map(i => i.name).join(', ')
                  : 'Nenhum insumo abaixo da margem mínima de segurança.'}
              </p>
            </div>

            {/* Box 4: Estimativa Determinística */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Estimativa Determinística:</span>
                <span className="font-mono font-bold text-slate-800">Histórico insuficiente</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Histórico insuficiente para estimativa confiável do dia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
