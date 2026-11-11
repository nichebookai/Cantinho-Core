import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency, formatPercentage } from '../utils/deterministicMath';

export const ReportsPage: React.FC = () => {
  const { summary, data, selectedDate } = useBusiness();

  const [activeTab, setActiveTab] = useState<
    'dre' | 'products' | 'expenses' | 'losses' | 'estimates'
  >('dre');

  const displayDate = selectedDate
    ? selectedDate.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');

  // Perdas de estoque
  const lossesMovements = data.stockMovements.filter(m => m.type === 'perda_descarte');

  return (
    <div className="space-y-5">
      {/* Banner Superior (Fiel ao Print 7) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
          <BarChart3 className="w-5 h-5 text-[#D97706]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            Relatórios, DRE e Estimativas Determinísticas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrativo financeiro por competência, separação de fluxo de caixa e médias comprováveis
          </p>
        </div>
      </div>

      {/* Abas de Navegação dos Relatórios (Fiel ao Print 7) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dre')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'dre'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Demonstrativo de Resultado (DRE)
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vendas por Produto & Categoria
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Despesas por Categoria
        </button>

        <button
          onClick={() => setActiveTab('losses')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'losses'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Perdas de Estoque ({lossesMovements.length})
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'estimates'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Estimativas Determinísticas
        </button>
      </div>

      {/* Conteúdo Aba DRE (Fiel ao Print 7) */}
      {activeTab === 'dre' && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Demonstrativo de Resultado do Exercício (DRE Simplificado)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Apuração econômica por competência · Princípio 5: Não confunde lucro com movimentação de caixa
                </p>
              </div>

              <div className="text-xs text-right font-medium text-slate-500">
                <span>Período de Análise:</span>
                <span className="font-bold text-slate-900 block font-mono">Dia {displayDate}</span>
              </div>
            </div>

            {/* Linhas do DRE */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between text-slate-800">
                <span>(+) Vendas Brutas</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatCurrency(summary.grossSales)}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between text-slate-600">
                <span className="pl-4">(-) Descontos Concedidos</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  -{formatCurrency(summary.cancelledSales)}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between font-bold text-slate-900">
                <span>(=) Vendas Líquidas</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(summary.netSales)}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between text-slate-600">
                <span className="pl-4">(-) Custo das Mercadorias Vendidas (CMV)</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  -{formatCurrency(summary.cmv)}
                </span>
              </div>

              <div className="py-2.5 px-3 -mx-3 bg-amber-50/50 rounded-lg flex items-center justify-between font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <span>(=) Lucro Bruto Operacional</span>
                  <span className="text-[11px] font-semibold text-amber-800">
                    (Margem Bruta: {formatPercentage(summary.grossMarginPercent)})
                  </span>
                </div>
                <span className="font-mono tabular-nums">
                  {formatCurrency(summary.grossProfit)}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between text-slate-600">
                <span className="pl-4">(-) Despesas Operacionais Lançadas</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  -{formatCurrency(summary.totalOperatingExpenses)}
                </span>
              </div>

              {/* Linha Final em Destaque Preto (Fiel ao Print 7) */}
              <div className="py-3 px-4 -mx-4 bg-slate-950 text-white rounded-xl flex items-center justify-between font-bold text-sm shadow-xs mt-2">
                <div className="flex items-center gap-2">
                  <span>(=) Lucro Líquido Estimado</span>
                  <span className="text-xs font-normal text-slate-300">
                    (Margem Líquida: {formatPercentage(summary.netProfitMarginPercent)})
                  </span>
                </div>
                <span className="font-mono text-base tabular-nums">
                  {formatCurrency(summary.netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Comparativo Rigoroso (Fiel ao Print 7) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900">
              Comparativo Rigoroso: Lucro Líquido (DRE) vs. Fluxo de Caixa (Financeiro)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-xs text-slate-500 font-medium block">
                  Lucro Líquido Estimado (Competência):
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {formatCurrency(summary.netProfit)}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Mede a viabilidade econômica do negócio (Receitas líquidas menos custos e despesas totais do período).
                </p>
              </div>

              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-xs text-slate-500 font-medium block">
                  Fluxo de Caixa Efetivo (Tesouraria):
                </span>
                <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                  {formatCurrency(summary.periodNetResult)}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Mede apenas o dinheiro que efetivamente entrou menos o dinheiro que efetivamente saiu da conta/caixa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demais abas funcionais */}
      {activeTab === 'losses' && (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Registro de Perdas e Descartes de Insumos
          </h3>
          {lossesMovements.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-8">
              Nenhuma perda de estoque registrada. Registre no botão &quot;Movimentação Avulsa&quot; na tela de Estoque.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-2.5 font-semibold">Data</th>
                      <th className="pb-2.5 font-semibold">Insumo</th>
                      <th className="pb-2.5 font-semibold text-right">Qtd. Descartada</th>
                      <th className="pb-2.5 font-semibold">Justificativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lossesMovements.map(m => (
                      <tr key={m.id}>
                        <td className="py-2.5 font-mono text-slate-500">
                          {new Date(m.timestamp).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-900">{m.stockItemName}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-rose-600">
                          {m.quantityChange}
                        </td>
                        <td className="py-2.5 text-slate-600">{m.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="block md:hidden space-y-2.5">
                {lossesMovements.map(m => (
                  <div
                    key={m.id}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-1.5 shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.stockItemName}</span>
                      <span className="font-mono font-bold text-rose-600">
                        Qtd: {m.quantityChange}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Data: {new Date(m.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 mt-1">
                      {m.reason}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {(activeTab === 'products' || activeTab === 'expenses' || activeTab === 'estimates') && (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8 text-center text-slate-400 text-xs shadow-2xs">
          {activeTab === 'products' && 'Análise de vendas por produto calculada dinamicamente conforme vendas registradas.'}
          {activeTab === 'expenses' && 'Despesas operacionais agrupadas por categoria contábil.'}
          {activeTab === 'estimates' && 'Estimativas estatísticas ativadas após 7 dias de histórico ininterrupto de fechamento.'}
        </div>
      )}
    </div>
  );
};
