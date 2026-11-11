import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  Receipt,
  X,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Product, ProductCategory, PaymentMethod, Sale } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

export const SalesPage: React.FC = () => {
  const { data, createSale, cancelSale } = useBusiness();

  // Filtros e busca
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado do Carrinho
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('0');

  // Modais de Comprovante e Estorno
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Categorias do Cardápio
  const categories: (ProductCategory | 'Todos')[] = [
    'Todos',
    'Sorvetes de Massa',
    'Picolés',
    'Açaí & Copos',
    'Outros'
  ];

  // Produtos filtrados
  const filteredProducts = data.products.filter(product => {
    if (!product.active) return false;
    const matchesCategory =
      selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Funções do Carrinho
  const addToCart = (product: Product) => {
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
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAmountPaidInput('');
    setDiscountInput('0');
    setFeedbackError(null);
  };

  // Cálculos do Carrinho
  const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  const discount = Math.max(0, parseFloat(discountInput) || 0);
  const total = Math.max(0, subtotal - discount);

  const amountPaidNumber = amountPaidInput === '' ? total : parseFloat(amountPaidInput) || 0;
  const changeAmount = paymentMethod === 'dinheiro' && amountPaidNumber > total ? amountPaidNumber - total : 0;

  // Finalizar Venda
  const handleCheckout = () => {
    if (cart.length === 0) {
      setFeedbackError('Adicione pelo menos um item ao carrinho.');
      return;
    }

    if (paymentMethod === 'dinheiro' && amountPaidNumber < total) {
      setFeedbackError('O valor pago em dinheiro não pode ser menor que o total da venda.');
      return;
    }

    const result = createSale(
      cart,
      paymentMethod,
      'Balcão',
      undefined,
      amountPaidNumber,
      discount
    );
    if (result.success && result.sale) {
      setCompletedSale(result.sale);
      clearCart();
    } else {
      setFeedbackError(result.error || 'Erro ao processar venda');
    }
  };

  // Confirmar Estorno
  const handleConfirmCancel = () => {
    if (!saleToCancel) return;
    if (!cancelReason.trim()) {
      alert('Informe o motivo do cancelamento para fins de auditoria.');
      return;
    }

    const result = cancelSale(saleToCancel.id, cancelReason);
    if (result.success) {
      setSaleToCancel(null);
      setCancelReason('');
    } else {
      alert(result.error || 'Não foi possível estornar a venda.');
    }
  };

  // Histórico recente das últimas vendas
  const recentSales = data.sales.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Layout de 2 Colunas: Catálogo de Produtos (Esquerda) e Carrinho Balcão (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Catálogo e Busca */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="liquid-card rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar sabor, picolé, copo de açaí..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categorias */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          {filteredProducts.length === 0 ? (
            <div className="liquid-card rounded-2xl p-12 text-center text-slate-400 text-xs">
              Nenhum produto encontrado nesta categoria ou busca.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                // Checa estoque correspondente
                const stockItem = data.stockItems.find(
                  s => s.id === product.linkedStockItemId
                );
                const hasStock = stockItem
                  ? stockItem.currentQuantity !== null && stockItem.currentQuantity > 0
                  : true;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="liquid-card rounded-xl p-3.5 text-left hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between h-36 cursor-pointer relative overflow-hidden"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-amber-800/80 uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold font-mono text-slate-900 tabular-nums">
                        {formatCurrency(product.salePrice)}
                      </span>
                      <div className="p-1.5 rounded-lg bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Badge de baixa combinada */}
                    {product.linkedPackagingStockItemId && (
                      <span className="absolute top-2 right-2 text-[9px] font-medium text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded-sm border border-sky-200">
                        + embalagem
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Carrinho do Balcão */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 sticky top-20">
          <div className="liquid-card rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Carrinho de Venda
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {feedbackError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{feedbackError}</span>
              </div>
            )}

            {/* Lista de Itens no Carrinho */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Selecione os produtos ao lado para iniciar a venda.
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-900 block truncate">
                        {item.product.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatCurrency(item.product.salePrice)} un
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold font-mono text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totalizadores */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Desconto (R$)</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={discountInput}
                  onChange={e => setDiscountInput(e.target.value)}
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-md text-right font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-900">Total a Pagar</span>
                <span className="text-xl font-extrabold font-mono text-amber-900 tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-colors cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PIX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-colors cursor-pointer ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dinheiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('debito')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-colors cursor-pointer ${
                    paymentMethod === 'debito'
                      ? 'bg-sky-50 border-sky-500 text-sky-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                  <span>Débito</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credito')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-semibold transition-colors cursor-pointer ${
                    paymentMethod === 'credito'
                      ? 'bg-purple-50 border-purple-500 text-purple-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>Crédito</span>
                </button>
              </div>

              {/* Se for dinheiro: cálculo de troco */}
              {paymentMethod === 'dinheiro' && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900">Valor Recebido (R$)</span>
                    <input
                      type="number"
                      step="0.50"
                      placeholder={total.toFixed(2)}
                      value={amountPaidInput}
                      onChange={e => setAmountPaidInput(e.target.value)}
                      className="w-24 px-2 py-1 bg-white border border-amber-300 rounded text-right font-mono font-bold text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200">
                    <span className="font-semibold text-slate-700">Troco a Devolver:</span>
                    <span className="font-bold font-mono text-emerald-800 text-sm tabular-nums">
                      {formatCurrency(changeAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                cart.length > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluir Venda (Baixar Estoque)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Vendas Recentes & Estornos */}
      <div className="liquid-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Vendas Recentes do Balcão
            </h3>
            <p className="text-xs text-slate-500">
              Registro auditável de vendas e opção de estorno com devolução de estoque
            </p>
          </div>
        </div>

        {recentSales.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Nenhuma venda registrada ainda.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-500">
                    <th className="pb-3 font-semibold">Horário</th>
                    <th className="pb-3 font-semibold">Itens Vendidos</th>
                    <th className="pb-3 font-semibold">Pagamento</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map(sale => {
                    const isCancelled = sale.status === 'cancelled';
                    const time = new Date(sale.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={sale.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 font-mono text-slate-500">
                          {sale.date} {time}
                        </td>
                        <td className="py-3 text-slate-800 font-medium">
                          {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3 uppercase font-mono text-[11px] text-slate-600">
                          {sale.paymentMethod}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="py-3 text-center">
                          {isCancelled ? (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              Estornada
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Concluída
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {!isCancelled && (
                            <button
                              onClick={() => setSaleToCancel(sale)}
                              className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Estornar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards for Recent Sales */}
            <div className="block md:hidden space-y-2.5">
              {recentSales.map(sale => {
                const isCancelled = sale.status === 'cancelled';
                const time = new Date(sale.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={sale.id}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2 shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">#{sale.id.slice(-6)}</span>
                        <span className="text-[10px] font-mono text-slate-400">· {sale.date} {time}</span>
                      </div>

                      {isCancelled ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          Estornada
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          Concluída
                        </span>
                      )}
                    </div>

                    <p className="text-slate-800 font-medium bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px]">
                      {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">{sale.paymentMethod}</span>
                        <span className="text-sm font-extrabold font-mono text-slate-900 tabular-nums">
                          {formatCurrency(sale.total)}
                        </span>
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => setSaleToCancel(sale)}
                          className="px-3 py-1.5 min-h-[36px] bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          <span>Estornar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de Comprovante de Venda Concluída */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-amber-900/10 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Venda Concluída!
              </h3>
              <p className="text-xs text-slate-500">
                Estoque e embalagens baixados com sucesso
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between text-slate-500">
                <span>Pedido:</span>
                <span className="font-mono font-bold">#{completedSale.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Pagamento:</span>
                <span className="font-mono font-bold uppercase">{completedSale.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total:</span>
                <span className="font-mono text-emerald-700">{formatCurrency(completedSale.total)}</span>
              </div>
              {completedSale.changeAmount !== undefined && completedSale.changeAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-900 font-medium pt-1">
                  <span>Troco Entregue:</span>
                  <span className="font-mono font-bold">{formatCurrency(completedSale.changeAmount)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCompletedSale(null)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Nova Venda no Balcão
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Estorno */}
      {saleToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold">
                Confirmar Estorno de Venda
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O cancelamento irá devolver as porções e embalagens ao estoque e remover o valor de{' '}
              <strong className="text-slate-900">{formatCurrency(saleToCancel.total)}</strong> do caixa.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo do Estorno (Auditoria Obrigatória) *
              </label>
              <textarea
                rows={2}
                required
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ex: Cliente desistiu antes do preparo, erro na seleção do sabor..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaleToCancel(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
