import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Check,
  AlertCircle
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Product, PaymentMethod, SaleChannel } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ isOpen, onClose }) => {
  const { data, createSale } = useBusiness();

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [channel, setChannel] = useState<SaleChannel>('Balcão');
  const [notes, setNotes] = useState('');
  const [saleDateTime, setSaleDateTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Produtos ativos
  const activeProducts = data.products.filter(p => p.active);
  // Atalhos rápidos (primeiros 4 produtos)
  const quickProducts = activeProducts.slice(0, 4);

  const addItemToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setErrorMsg(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const total = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setErrorMsg('Adicione pelo menos um item à venda.');
      return;
    }

    const result = createSale(
      cart,
      paymentMethod,
      channel,
      notes.trim() || undefined,
      total,
      0,
      saleDateTime
    );

    if (result.success) {
      setCart([]);
      setNotes('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg(result.error || 'Erro ao processar venda.');
    }
  };

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    debito: 'Débito',
    credito: 'Crédito'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho do Modal */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#C2410C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Registrar Venda Rápida
              </h2>
              <p className="text-[11px] text-slate-500">
                Baixa automática de estoque e congelamento de preço
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal - Rolagem Segura Sem Estouro */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Adicionar Produtos do Cardápio */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Atalhos Rápidos de Produtos
            </label>

            {/* Grid 2 colunas no mobile para não sobrepor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickProducts.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => addItemToCart(prod)}
                  className="flex items-center justify-between p-2.5 bg-amber-50/60 hover:bg-amber-100/80 text-slate-900 border border-amber-200/80 rounded-xl transition-all cursor-pointer text-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div className="w-5 h-5 rounded-full bg-amber-200/80 flex items-center justify-center shrink-0">
                      <Plus className="w-3.5 h-3.5 text-[#C2410C] stroke-[3]" />
                    </div>
                    <span className="font-bold truncate text-slate-900 text-[11px]">
                      {prod.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#C2410C] shrink-0 text-xs">
                    {formatCurrency(prod.salePrice)}
                  </span>
                </button>
              ))}
            </div>

            {/* Dropdown Cardápio Completo */}
            <div className="pt-1">
              <select
                value={selectedProductId}
                onChange={e => {
                  const prod = activeProducts.find(p => p.id === e.target.value);
                  if (prod) {
                    addItemToCart(prod);
                    setSelectedProductId('');
                  }
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="">Selecione outro produto no cardápio...</option>
                {activeProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.salePrice)} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Itens da Venda */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-700 font-bold text-xs">
              <span>Itens no Pedido ({cart.reduce((acc, i) => acc + i.quantity, 0)})</span>
              <span className="font-mono font-semibold text-slate-500">Subtotal</span>
            </div>

            <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/60 min-h-[80px]">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 py-4 text-xs">
                  Nenhum item adicionado. Toque nos botões acima para incluir na venda.
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 block truncate text-xs">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatCurrency(item.product.salePrice)} cada
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-1 border border-slate-300 rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 cursor-pointer rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold font-mono text-slate-900 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 cursor-pointer rounded-r-lg"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-slate-900 text-xs min-w-[65px] text-right">
                          {formatCurrency(item.product.salePrice * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formas de Pagamento e Canal de Venda */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1.5">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['dinheiro', 'pix', 'debito', 'credito'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold transition-all cursor-pointer text-xs ${
                      paymentMethod === method
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {paymentMethodLabels[method]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1.5">
                Canal da Venda
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Balcão', 'Mesa', 'Entrega'] as SaleChannel[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold transition-all cursor-pointer text-xs ${
                      channel === c
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data/Horário e Observação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Data e Horário
              </label>
              <input
                type="datetime-local"
                value={saleDateTime}
                onChange={e => setSaleDateTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Observação (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Mesa 04, embalar para viagem..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Rodapé do Modal - Total e Ações Empilhados no Mobile */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start sm:gap-3">
            <span className="text-xs text-slate-500 font-bold">Total a Pagar:</span>
            <span className="text-2xl font-extrabold font-mono text-[#C2410C] tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 border border-slate-300 sm:border-transparent transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className={`flex-2 sm:flex-none min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                cart.length > 0
                  ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Concluir Venda</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
