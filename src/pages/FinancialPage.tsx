import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { FinancialEntry, FinancialEntryType, FinancialStatus, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface FinancialPageProps {
  onOpenCashClosure: () => void;
}

export const FinancialPage: React.FC<FinancialPageProps> = ({ onOpenCashClosure }) => {
  const {
    data,
    summary,
    addFinancialEntry,
    updateFinancialEntry,
    updateFinancialEntryStatus,
    deleteFinancialEntry
  } = useBusiness();

  // Filtros
  const [filterType, setFilterType] = useState<FinancialEntryType | 'todos'>('todos');
  const [filterStatus, setFilterStatus] = useState<FinancialStatus | 'todos'>('todos');

  // Modal Novo Lançamento
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<FinancialEntryType>('despesa');
  const [entryCategory, setEntryCategory] = useState('Energia Elétrica (Freezers)');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [entryStatus, setEntryStatus] = useState<FinancialStatus>('pago');
  const [entryPaymentMethod, setEntryPaymentMethod] = useState<PaymentMethod>('pix');

  // Modal Editar Lançamento
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);

  // Modal Confirmar Exclusão
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntry | null>(null);

  // Salvar novo lançamento
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(entryAmount);
    if (!entryDescription.trim() || isNaN(amount) || amount <= 0) return;

    addFinancialEntry({
      date: entryDate,
      type: entryType,
      category: entryCategory,
      description: entryDescription.trim(),
      amount,
      status: entryStatus,
      paymentMethod: entryPaymentMethod
    });

    setIsAddModalOpen(false);
    setEntryDescription('');
    setEntryAmount('');
  };

  // Salvar edição de lançamento
  const handleSaveEditEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    updateFinancialEntry(editingEntry);
    setEditingEntry(null);
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete) return;
    deleteFinancialEntry(entryToDelete.id);
    setEntryToDelete(null);
  };

  // Filtragem
  const filteredEntries = data.financialEntries.filter(entry => {
    const matchesType = filterType === 'todos' || entry.type === filterType;
    const matchesStatus = filterStatus === 'todos' || entry.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            Gestão Financeira & Fluxo de Caixa
          </h2>
          <p className="text-xs text-slate-500">
            Controle auditável de receitas de balcão, despesas operacionais e fechamento diário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lançamento</span>
          </button>
          <button
            onClick={onOpenCashClosure}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Fechamento de Caixa</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Total em Caixa */}
        <div className="liquid-card rounded-2xl p-5 border border-amber-200">
          <span className="text-xs font-semibold text-slate-500 block">
            Saldo Líquido em Caixa
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {formatCurrency(summary.totalCashBalance)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Entradas Pagas − Saídas Pagas
          </span>
        </div>

        {/* Entradas Efetivadas */}
        <div className="liquid-card rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-500 block">
            Total de Entradas Pagas
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 flex items-center gap-1 tabular-nums">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            {formatCurrency(summary.totalPaidInflows)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Vendas à vista, PIX e cartões
          </span>
        </div>

        {/* Saídas Efetivadas */}
        <div className="liquid-card rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-500 block">
            Total de Saídas Pagas
          </span>
          <span className="text-2xl font-bold font-mono text-rose-700 mt-1 flex items-center gap-1 tabular-nums">
            <ArrowDownRight className="w-5 h-5 text-rose-600" />
            {formatCurrency(summary.totalPaidOutflows)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.pendingOperatingExpenses > 0 ? (
              <span className="text-amber-700 font-semibold">
                +{formatCurrency(summary.pendingOperatingExpenses)} contas a pagar pendentes
              </span>
            ) : (
              'Todas as contas pagas'
            )}
          </span>
        </div>
      </div>

      {/* Extrato Financeiro */}
      <div className="liquid-card rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Livro Caixa & Extrato Detalhado
            </h3>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterType('todos')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterType === 'todos' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('receita')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterType === 'receita' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-600'
                }`}
              >
                Entradas
              </button>
              <button
                onClick={() => setFilterType('despesa')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterType === 'despesa' ? 'bg-white shadow-xs text-rose-800 font-bold' : 'text-slate-600'
                }`}
              >
                Saídas
              </button>
              <button
                onClick={() => setFilterType('ajuste_caixa')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterType === 'ajuste_caixa' ? 'bg-white shadow-xs text-amber-900 font-bold' : 'text-slate-600'
                }`}
              >
                Ajustes
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus('todos')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterStatus === 'todos' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('pago')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterStatus === 'pago' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-slate-600'
                }`}
              >
                Pagos
              </button>
              <button
                onClick={() => setFilterStatus('pendente')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filterStatus === 'pendente' ? 'bg-white shadow-xs text-amber-800 font-bold' : 'text-slate-600'
                }`}
              >
                Pendentes
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Lançamentos */}
        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhum lançamento financeiro encontrado com os filtros selecionados.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">Data</th>
                    <th className="pb-3 font-semibold">Descrição</th>
                    <th className="pb-3 font-semibold">Categoria</th>
                    <th className="pb-3 font-semibold">Pagamento</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Valor (R$)</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map(entry => {
                    const isReceita = entry.type === 'receita';
                    const isAjuste = entry.type === 'ajuste_caixa';
                    const isPositive = isReceita || (isAjuste && entry.amount >= 0);

                    return (
                      <tr key={entry.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 font-mono text-slate-500 whitespace-nowrap">
                          {entry.date}
                        </td>
                        <td className="py-3 font-medium text-slate-900">
                          {entry.description}
                        </td>
                        <td className="py-3 text-slate-600">
                          {entry.category}
                        </td>
                        <td className="py-3 font-mono text-[11px] uppercase text-slate-500">
                          {entry.paymentMethod || '-'}
                        </td>
                        <td className="py-3 text-center">
                          {entry.status === 'pago' ? (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Pago
                            </span>
                          ) : (
                            <button
                              onClick={() => updateFinancialEntryStatus(entry.id, 'pago')}
                              className="text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 transition-colors cursor-pointer"
                              title="Clique para marcar como pago"
                            >
                              Pendente (Quitar)
                            </button>
                          )}
                        </td>
                        <td
                          className={`py-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive
                            ? `+${formatCurrency(entry.amount)}`
                            : `-${formatCurrency(Math.abs(entry.amount))}`}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar lançamento"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEntryToDelete(entry)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards for Financial Entries */}
            <div className="block md:hidden space-y-3">
              {filteredEntries.map(entry => {
                const isReceita = entry.type === 'receita';
                const isAjuste = entry.type === 'ajuste_caixa';
                const isPositive = isReceita || (isAjuste && entry.amount >= 0);

                return (
                  <div
                    key={entry.id}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 block">{entry.date}</span>
                        <h4 className="font-bold text-slate-900 leading-snug mt-0.5">{entry.description}</h4>
                        <span className="text-[11px] font-medium text-slate-500 block">{entry.category}</span>
                      </div>

                      {entry.status === 'pago' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 whitespace-nowrap">
                          Pago
                        </span>
                      ) : (
                        <button
                          onClick={() => updateFinancialEntryStatus(entry.id, 'pago')}
                          className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 whitespace-nowrap cursor-pointer"
                        >
                          Pendente (Quitar)
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono uppercase">
                          {entry.paymentMethod || 'Outro'}
                        </span>
                        <span
                          className={`font-mono text-base font-extrabold tabular-nums ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive
                            ? `+${formatCurrency(entry.amount)}`
                            : `-${formatCurrency(Math.abs(entry.amount))}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Histórico de Fechamentos de Caixa */}
      <div className="liquid-card rounded-2xl p-4 md:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Histórico de Fechamentos de Gaveta
          </h3>
        </div>

        {data.cashClosures.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Nenhum fechamento diário realizado ainda. Utilize o botão &quot;Fechamento de Caixa&quot; para auditar a gaveta.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2.5 font-semibold">Data/Hora</th>
                    <th className="pb-2.5 font-semibold text-right">Saldo Teórico</th>
                    <th className="pb-2.5 font-semibold text-right">Valor Contado</th>
                    <th className="pb-2.5 font-semibold text-right">Diferença (Sobra/Falta)</th>
                    <th className="pb-2.5 font-semibold">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.cashClosures.map(closure => {
                    const isExact = Math.abs(closure.difference) < 0.01;
                    const isSobra = closure.difference > 0;
                    const time = new Date(closure.closedAt).toLocaleString('pt-BR');

                    return (
                      <tr key={closure.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono text-slate-500">{time}</td>
                        <td className="py-2.5 text-right font-mono font-medium text-slate-700 tabular-nums">
                          {formatCurrency(closure.theoreticalCash)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrency(closure.countedCash)}
                        </td>
                        <td
                          className={`py-2.5 text-right font-mono font-bold tabular-nums ${
                            isExact ? 'text-emerald-600' : isSobra ? 'text-sky-700' : 'text-rose-600'
                          }`}
                        >
                          {isExact
                            ? 'R$ 0,00 (Exato)'
                            : isSobra
                            ? `+${formatCurrency(closure.difference)} (Sobra)`
                            : `${formatCurrency(closure.difference)} (Falta)`}
                        </td>
                        <td className="py-2.5 text-slate-600">{closure.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards for Cash Closures */}
            <div className="block md:hidden space-y-2.5">
              {data.cashClosures.map(closure => {
                const isExact = Math.abs(closure.difference) < 0.01;
                const isSobra = closure.difference > 0;
                const time = new Date(closure.closedAt).toLocaleString('pt-BR');

                return (
                  <div
                    key={closure.id}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="font-mono text-slate-500 font-semibold">{time}</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                          isExact
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isSobra
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isExact
                          ? 'Exato (0,00)'
                          : isSobra
                          ? `+${formatCurrency(closure.difference)} (Sobra)`
                          : `${formatCurrency(closure.difference)} (Falta)`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700 pt-0.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Teórico</span>
                        <span className="font-mono font-semibold">{formatCurrency(closure.theoreticalCash)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Contado na Gaveta</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(closure.countedCash)}</span>
                      </div>
                    </div>

                    {closure.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/60 mt-1">
                        &quot;{closure.notes}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal: Novo Lançamento Financeiro */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-900/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Novo Lançamento Financeiro
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Lançamento *
                  </label>
                  <select
                    value={entryType}
                    onChange={e => setEntryType(e.target.value as FinancialEntryType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="despesa">Despesa (Saída)</option>
                    <option value="receita">Receita (Entrada)</option>
                    <option value="ajuste_caixa">Ajuste de Caixa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={entryCategory}
                    onChange={e => setEntryCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Energia Elétrica (Freezers)">Energia Elétrica (Freezers)</option>
                    <option value="Aluguel do Ponto">Aluguel do Ponto</option>
                    <option value="Matéria-prima & Insumos">Matéria-prima & Insumos</option>
                    <option value="Embalagens & Descartáveis">Embalagens & Descartáveis</option>
                    <option value="Manutenção de Freezers/Máquinas">Manutenção de Freezers/Máquinas</option>
                    <option value="Equipe / Salários">Equipe / Salários</option>
                    <option value="Venda Balcão Avulsa">Venda Balcão Avulsa</option>
                    <option value="Fundo de Troco">Fundo de Troco</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de luz Copel referência nov/2026..."
                  value={entryDescription}
                  onChange={e => setEntryDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={entryAmount}
                    onChange={e => setEntryAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data do Vencimento / Pagamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={entryPaymentMethod}
                    onChange={e => setEntryPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro (Gaveta)</option>
                    <option value="debito">Cartão de Débito</option>
                    <option value="credito">Cartão de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Situação
                  </label>
                  <select
                    value={entryStatus}
                    onChange={e => setEntryStatus(e.target.value as FinancialStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pago">Já Pago (Efetivado)</option>
                    <option value="pendente">Pendente (A Pagar)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Lançamento Financeiro */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-900/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Editar Lançamento Financeiro
              </h3>
              <button onClick={() => setEditingEntry(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEntry} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Lançamento *
                  </label>
                  <select
                    value={editingEntry.type}
                    onChange={e =>
                      setEditingEntry({
                        ...editingEntry,
                        type: e.target.value as FinancialEntryType
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="despesa">Despesa (Saída)</option>
                    <option value="receita">Receita (Entrada)</option>
                    <option value="ajuste_caixa">Ajuste de Caixa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEntry.category}
                    onChange={e =>
                      setEditingEntry({ ...editingEntry, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.description}
                  onChange={e =>
                    setEditingEntry({ ...editingEntry, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editingEntry.amount}
                    onChange={e =>
                      setEditingEntry({
                        ...editingEntry,
                        amount: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingEntry.date}
                    onChange={e =>
                      setEditingEntry({ ...editingEntry, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={editingEntry.paymentMethod || 'pix'}
                    onChange={e =>
                      setEditingEntry({
                        ...editingEntry,
                        paymentMethod: e.target.value as PaymentMethod
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Situação
                  </label>
                  <select
                    value={editingEntry.status}
                    onChange={e =>
                      setEditingEntry({
                        ...editingEntry,
                        status: e.target.value as FinancialStatus
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pago">Pago (Efetivado)</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Lançamento */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Lançamento Financeiro
                </h3>
                <span className="text-xs text-rose-600 font-semibold">
                  Recálculo imediato de caixa e DRE
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja realmente apagar o lançamento{' '}
              <strong className="text-slate-900 font-bold">
                &quot;{entryToDelete.description}&quot;
              </strong>{' '}
              no valor de{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(entryToDelete.amount)}
              </strong>
              ?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Esta ação removerá permanentemente o valor do livro caixa, recalculando de forma determinística todas as métricas financeiras.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm cursor-pointer text-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
