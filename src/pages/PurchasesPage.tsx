import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Purchase, PurchaseItem, PaymentMethod, FinancialStatus, StockUnit } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

export const PurchasesPage: React.FC = () => {
  const { data, addPurchase, updatePurchase, deletePurchase } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'Todas' | 'Pagas' | 'Pendentes'>('Todas');
  const [selectedUnit, setSelectedUnit] = useState<StockUnit | 'todas'>('todas');

  // Modal Registrar Compra
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<FinancialStatus>('pago');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      stockItemId: data.stockItems[0]?.id || '',
      stockItemName: data.stockItems[0]?.name || '',
      quantity: 1,
      unitCost: data.stockItems[0]?.unitCost || 85.0,
      totalCost: data.stockItems[0]?.unitCost || 85.0
    }
  ]);

  // Modal Editar Compra
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  // Modal Confirmar Exclusão com Estorno de Estoque
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

  const unitsList: { id: StockUnit | 'todas'; label: string }[] = [
    { id: 'todas', label: 'Todas Unidades' },
    { id: 'balde', label: 'Balde' },
    { id: 'unidade', label: 'Unidade' },
    { id: 'porção', label: 'Porção' },
    { id: 'ml', label: 'ml' },
    { id: 'litro', label: 'Litro' },
    { id: 'kg', label: 'kg' },
    { id: 'caixa', label: 'Caixa' },
    { id: 'pacote', label: 'Pacote' }
  ];

  const handleAddItemRow = () => {
    const firstStock = data.stockItems[0];
    if (!firstStock) return;
    setItems(prev => [
      ...prev,
      {
        stockItemId: firstStock.id,
        stockItemName: firstStock.name,
        quantity: 1,
        unitCost: firstStock.unitCost || 50.0,
        totalCost: firstStock.unitCost || 50.0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemStockChange = (index: number, stockItemId: string) => {
    const stockItem = data.stockItems.find(s => s.id === stockItemId);
    if (!stockItem) return;

    setItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const unitCost = stockItem.unitCost || 50.0;
          return {
            ...item,
            stockItemId: stockItem.id,
            stockItemName: stockItem.name,
            unitCost,
            totalCost: unitCost * item.quantity
          };
        }
        return item;
      })
    );
  };

  const handleItemQtyChange = (index: number, quantity: number) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const qty = Math.max(0.1, quantity);
          return {
            ...item,
            quantity: qty,
            totalCost: qty * item.unitCost
          };
        }
        return item;
      })
    );
  };

  const handleItemCostChange = (index: number, cost: number) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const c = Math.max(0, cost);
          return {
            ...item,
            unitCost: c,
            totalCost: c * item.quantity
          };
        }
        return item;
      })
    );
  };

  const totalPurchaseAmount = items.reduce((acc, item) => acc + item.totalCost, 0);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() || items.length === 0) return;

    addPurchase({
      date,
      supplier: supplier.trim(),
      invoiceNumber: invoiceNumber.trim() || undefined,
      items,
      totalAmount: totalPurchaseAmount,
      paymentMethod,
      paymentStatus,
      notes: notes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setSupplier('');
    setInvoiceNumber('');
    setNotes('');
  };

  const handleSaveEditPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchase) return;

    updatePurchase(editingPurchase);
    setEditingPurchase(null);
  };

  const handleConfirmDelete = () => {
    if (!purchaseToDelete) return;
    deletePurchase(purchaseToDelete.id);
    setPurchaseToDelete(null);
  };

  // Filtragem
  const filteredPurchases = data.purchases.filter(p => {
    const matchesSearch =
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.items.some(it => it.stockItemName.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesTab = true;
    if (statusTab === 'Pagas') matchesTab = p.paymentStatus === 'pago';
    if (statusTab === 'Pendentes') matchesTab = p.paymentStatus === 'pendente';

    let matchesUnit = true;
    if (selectedUnit !== 'todas') {
      matchesUnit = p.items.some(item => {
        const stock = data.stockItems.find(s => s.id === item.stockItemId);
        return stock?.unit === selectedUnit;
      });
    }

    return matchesSearch && matchesTab && matchesUnit;
  });

  const periodTotal = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

  return (
    <div className="space-y-5">
      {/* Banner Superior com Botão Preto + Registrar Compra (Fiel ao Print 4) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
            <Truck className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Compras e Reposição de Estoque
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registros integrados com atualização de custos unitários e contas a pagar
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Compra</span>
        </button>
      </div>

      {/* Barra de Busca + Abas + Filtro de Unidades + Total do Período */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar compra por fornecedor, insumo ou código..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Abas Pagas / Pendentes */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setStatusTab('Todas')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusTab === 'Todas' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Todas ({data.purchases.length})
              </button>
              <button
                onClick={() => setStatusTab('Pagas')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusTab === 'Pagas' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Pagas
              </button>
              <button
                onClick={() => setStatusTab('Pendentes')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusTab === 'Pendentes'
                    ? 'bg-white shadow-2xs text-slate-900 font-bold'
                    : 'text-slate-600'
                }`}
              >
                Pendentes
              </button>
            </div>

            {/* Total do Período */}
            <div className="text-xs whitespace-nowrap">
              <span className="text-slate-500">Total do Período: </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatCurrency(periodTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Pílulas de Unidade de Medida */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap mr-1">Filtrar Unidade:</span>
          {unitsList.map(u => {
            const isSelected = selectedUnit === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUnit(u.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#C2410C] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela de Compras (Fiel ao Print 4 com Ações de Editar e Excluir) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 md:p-6 shadow-2xs">
        {filteredPurchases.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma compra registrada para os filtros selecionados.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">Código / Data</th>
                    <th className="pb-3 font-semibold">Fornecedor</th>
                    <th className="pb-3 font-semibold">Itens Comprados</th>
                    <th className="pb-3 font-semibold">Forma Pagto</th>
                    <th className="pb-3 font-semibold text-center">Estoque Atualizado</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Valor Total</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map(pur => (
                    <tr key={pur.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono text-slate-600">
                        <span className="font-bold text-slate-900 block">#{pur.id.slice(-6)}</span>
                        <span className="text-[11px] text-slate-400">{pur.date}</span>
                      </td>

                      <td className="py-3 font-semibold text-slate-900">
                        {pur.supplier}
                        {pur.invoiceNumber && (
                          <span className="text-[11px] font-normal text-slate-400 block font-mono">
                            Doc: {pur.invoiceNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-slate-700">
                        <div className="space-y-0.5 text-[11px]">
                          {pur.items.map((it, idx) => {
                            const stock = data.stockItems.find(s => s.id === it.stockItemId);
                            return (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span>{it.quantity}x {it.stockItemName}</span>
                                {stock && (
                                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-medium">
                                    {stock.unit}
                                  </span>
                                )}
                                <span className="text-slate-400 font-mono">({formatCurrency(it.unitCost)})</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 uppercase font-mono text-[11px] text-slate-600">
                        {pur.paymentMethod}
                      </td>

                      <td className="py-3 text-center">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Sim
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            pur.paymentStatus === 'pago'
                              ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                              : 'text-amber-800 bg-amber-50 border-amber-200'
                          }`}
                        >
                          {pur.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(pur.totalAmount)}
                      </td>

                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPurchase(pur)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Compra"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPurchaseToDelete(pur)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Revogar / Excluir Compra (Estornar Estoque)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="block md:hidden space-y-3">
              {filteredPurchases.map(pur => (
                <div
                  key={pur.id}
                  className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">#{pur.id.slice(-6)}</span>
                        <span className="text-[11px] font-mono text-slate-400">· {pur.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-0.5">{pur.supplier}</h4>
                      {pur.invoiceNumber && (
                        <span className="text-[10px] text-slate-500 font-mono block">Doc: {pur.invoiceNumber}</span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                        pur.paymentStatus === 'pago'
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {pur.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Itens Adquiridos</span>
                    {pur.items.map((it, idx) => {
                      const stock = data.stockItems.find(s => s.id === it.stockItemId);
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-slate-800">
                          <span>
                            {it.quantity}x {it.stockItemName} {stock ? `(${stock.unit})` : ''}
                          </span>
                          <span className="font-mono text-slate-500">{formatCurrency(it.unitCost)}/un</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-medium text-slate-500 block">Total ({pur.paymentMethod.toUpperCase()})</span>
                      <span className="text-base font-extrabold font-mono text-slate-900 tabular-nums">
                        {formatCurrency(pur.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPurchase(pur)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setPurchaseToDelete(pur)}
                        className="p-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                        title="Revogar / Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Registrar Compra */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Compra de Lote
                </h3>
                <p className="text-xs text-slate-500">
                  Atualização automática de estoque e lançamento financeiro
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="flex-1 flex flex-col min-h-0 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fornecedor / Distribuidora *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gelato Brasil, Açaí Frutas..."
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nota Fiscal / Pedido
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: NF-40892"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data da Compra *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Itens Adquiridos */}
              <div className="flex-1 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Itens do Lote</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-[#C2410C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    <div className="col-span-5">
                      <select
                        value={item.stockItemId}
                        onChange={e => handleItemStockChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                      >
                        {data.stockItems.map(st => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={e => handleItemQtyChange(idx, parseFloat(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-right"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Custo Un"
                        value={item.unitCost}
                        onChange={e => handleItemCostChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono text-right"
                      />
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.totalCost)}
                    </div>

                    <div className="col-span-1 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagamento e Total */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
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
                    Situação da Despesa
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as FinancialStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pago">Já Pago</option>
                    <option value="pendente">Pendente (A pagar)</option>
                  </select>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-right">
                  <span className="text-[11px] text-amber-800 block">Total da Compra</span>
                  <span className="text-base font-extrabold font-mono text-amber-950 tabular-nums">
                    {formatCurrency(totalPurchaseAmount)}
                  </span>
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
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirmar Entrada no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Compra */}
      {editingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Editar Registro de Compra #{editingPurchase.id.slice(-6)}
              </h3>
              <button onClick={() => setEditingPurchase(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPurchase} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fornecedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPurchase.supplier}
                    onChange={e =>
                      setEditingPurchase({ ...editingPurchase, supplier: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Doc / Nota Fiscal
                  </label>
                  <input
                    type="text"
                    value={editingPurchase.invoiceNumber || ''}
                    onChange={e =>
                      setEditingPurchase({ ...editingPurchase, invoiceNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data da Compra *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingPurchase.date}
                    onChange={e =>
                      setEditingPurchase({ ...editingPurchase, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor Total (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPurchase.totalAmount}
                    onChange={e =>
                      setEditingPurchase({
                        ...editingPurchase,
                        totalAmount: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={editingPurchase.paymentMethod}
                    onChange={e =>
                      setEditingPurchase({
                        ...editingPurchase,
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
                    value={editingPurchase.paymentStatus}
                    onChange={e =>
                      setEditingPurchase({
                        ...editingPurchase,
                        paymentStatus: e.target.value as FinancialStatus
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pago">Já Pago</option>
                    <option value="pendente">Pendente (A pagar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={editingPurchase.notes || ''}
                  onChange={e =>
                    setEditingPurchase({ ...editingPurchase, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPurchase(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Revogação/Exclusão com Estorno Automático */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Revogar Compra e Estornar Estoque
                </h3>
                <span className="text-xs text-rose-600 font-semibold">
                  Ação com estorno automático de insumos
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você está prestes a excluir a compra de{' '}
              <strong className="text-slate-900 font-bold">{purchaseToDelete.supplier}</strong> (
              #{purchaseToDelete.id.slice(-6)}) no valor de{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(purchaseToDelete.totalAmount)}
              </strong>
              .
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>O que acontecerá automaticamente:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                <li>As quantidades de todos os itens comprados serão deduzidas do estoque.</li>
                <li>Um registro de estorno será gravado no histórico de movimentações.</li>
                <li>A despesa financeira correspondente será cancelada do livro caixa e DRE.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPurchaseToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm cursor-pointer text-xs"
              >
                Sim, Estornar e Excluir Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
