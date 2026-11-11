import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/deterministicMath';

interface CashClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashClosureModal: React.FC<CashClosureModalProps> = ({ isOpen, onClose }) => {
  const { summary, performCashClosure, data } = useBusiness();
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'warning';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const theoreticalCash = summary.currentDrawerCash;
  const countedCash = countedCashInput === '' ? theoreticalCash : parseFloat(countedCashInput) || 0;
  const difference = countedCash - theoreticalCash;

  const handleConfirmClosure = (e: React.FormEvent) => {
    e.preventDefault();
    const { closure, difference: diff } = performCashClosure(countedCash, notes);

    if (Math.abs(diff) < 0.01) {
      setResultMessage({
        type: 'success',
        text: `Caixa fechado com sucesso! Saldo físico exato: ${formatCurrency(closure.countedCash)}.`
      });
    } else if (diff > 0) {
      setResultMessage({
        type: 'warning',
        text: `Fechamento registrado com Sobra de Caixa de ${formatCurrency(diff)}. Lançamento contábil gerado.`
      });
    } else {
      setResultMessage({
        type: 'warning',
        text: `Fechamento registrado com Quebra/Falta de Caixa de ${formatCurrency(Math.abs(diff))}. Lançamento contábil gerado.`
      });
    }

    setTimeout(() => {
      setResultMessage(null);
      setCountedCashInput('');
      setNotes('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-amber-900/10 overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-900/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-lg shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fechamento & Conferência de Caixa
              </h2>
              <p className="text-xs text-slate-500">
                Auditoria determinística da gaveta física de dinheiro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resultMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Operação Concluída
            </h3>
            <p className="text-sm text-slate-600">{resultMessage.text}</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmClosure} className="p-6 space-y-5">
            {/* Resumo Teórico Determinístico */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60">
              <div>
                <span className="text-[11px] font-medium text-amber-900/70 block">
                  Fundo Padrão de Abertura
                </span>
                <span className="text-sm font-bold font-mono text-slate-800">
                  {formatCurrency(data.settings.defaultCashDrawerOpening)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-amber-900/70 block">
                  Saldo Teórico Calculado
                </span>
                <span className="text-base font-extrabold font-mono text-amber-900">
                  {formatCurrency(theoreticalCash)}
                </span>
              </div>
            </div>

            {/* Input de Contagem Física */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Valor Físico Apurado na Gaveta (R$) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={theoreticalCash.toFixed(2)}
                  value={countedCashInput}
                  onChange={e => setCountedCashInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Conte as cédulas e moedas físicas presentes na gaveta no momento do fechamento.
              </p>
            </div>

            {/* Comparativo de Reconciliação */}
            <div className="p-3.5 rounded-xl border transition-colors bg-slate-50/80 border-slate-200">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Diferença de Conferência:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    Math.abs(difference) < 0.01
                      ? 'text-emerald-600'
                      : difference > 0
                      ? 'text-sky-700'
                      : 'text-rose-600'
                  }`}
                >
                  {difference > 0 ? `+${formatCurrency(difference)} (Sobra)` : difference < 0 ? `${formatCurrency(difference)} (Falta)` : 'R$ 0,00 (Exato)'}
                </span>
              </div>
              {Math.abs(difference) >= 0.01 && (
                <div className="mt-2 text-[11px] text-slate-600 flex items-start gap-1.5 pt-2 border-t border-slate-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {difference > 0
                      ? 'Uma entrada de ajuste de Sobra de Caixa será gerada automaticamente no extrato.'
                      : 'Uma saída de ajuste de Quebra/Falta de Caixa será gerada automaticamente no extrato.'}
                  </span>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Observações do Operador (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Turno da tarde concluído, sangria realizada para o cofre central..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirmar Fechamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
