import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Check,
  Calendar,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Venda
              </h2>
              <p className="text-xs text-slate-500">
                Baixa de estoque e congelamento de preço no momento da venda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Adicionar Produtos do Cardápio */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              Adicionar Produtos do Cardápio
            </label>

            {/* Chips rápidos com "+" */}
            <div className="flex flex-wrap items-center gap-2">
              {quickProducts.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => addItemToCart(prod)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#C2410C]" />
                  <span>{prod.name}</span>
                  <span className="font-mono text-slate-500">{formatCurrency(prod.salePrice)}</span>
                </button>
              ))}
            </div>

            {/* Dropdown Cardápio Completo */}
            <select
              value={selectedProductId}
              onChange={e => {
                const prod = activeProducts.find(p => p.id === e.target.value);
                if (prod) {
                  addItemToCart(prod);
                  setSelectedProductId('');
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-colors"
            >
              <option value="">Selecione outro produto no cardápio completo...</option>
              {activeProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.salePrice)} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Itens da Venda */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-600 font-semibold">
              <span>Itens da Venda ({cart.reduce((acc, i) => acc + i.quantity, 0)})</span>
              <span>Subtotal</span>
            </div>

            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 min-h-[90px] flex flex-col justify-center">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 py-3">
                  Nenhum item adicionado ainda. Toque nos botões rápidos ou selecione acima para compor a venda.
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-900 block truncate">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatCurrency(item.product.salePrice)} cada
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border border-slate-300 rounded-md bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold font-mono text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-slate-900 w-20 text-right">
                          {formatCurrency(item.product.salePrice * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['dinheiro', 'pix', 'debito', 'credito'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 rounded-xl text-center font-bold capitalize transition-colors cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-[#EA580C] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Canal da Venda
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Balcão', 'Mesa', 'Entrega'] as SaleChannel[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-2 px-1 rounded-xl text-center font-bold transition-colors cursor-pointer ${
                      channel === c
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data/Horário e Observação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data e Horário
              </label>
              <input
                type="datetime-local"
                value={saleDateTime}
                onChange={e => setSaleDateTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observação (Mesa / Cliente)
              </label>
              <input
                type="text"
                placeholder="Ex: Mesa 04, viagem, embalar com gelo..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Rodapé com Total a Pagar e Ação */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 font-medium">Total a Pagar:</span>
            <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                cart.length > 0
                  ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
