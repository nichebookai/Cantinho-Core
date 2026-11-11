import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowUpDown,
  ClipboardCheck,
  Search,
  Trash2,
  Edit2,
  X,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { StockCategory, StockItem, StockUnit, StockMovementType } from '../types';
import { formatCurrency, formatStockQuantityWithPackage } from '../utils/deterministicMath';

export const StockPage: React.FC = () => {
  const {
    data,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    adjustStockQuantity,
    performPhysicalInventory
  } = useBusiness();

  // Abas superiores: Itens de Estoque vs Histórico de Movimentações
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'movements'>('items');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'Todas'>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Normal' | 'Estoque Baixo' | 'Sem Contagem'>('Todos');
  const [selectedUnit, setSelectedUnit] = useState<StockUnit | 'todas'>('todas');

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [targetItemForMovement, setTargetItemForMovement] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  // Formulário Novo Item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<StockCategory>('Sorvetes de Massa');
  const [newItemUnit, setNewItemUnit] = useState<StockUnit>('balde');
  const [newItemMinStock, setNewItemMinStock] = useState('2');
  const [newItemQty, setNewItemQty] = useState('5');
  const [newItemCost, setNewItemCost] = useState('85.00');
  const [newItemItemsPerPackage, setNewItemItemsPerPackage] = useState('1');
  const [newItemPackageUnitName, setNewItemPackageUnitName] = useState('unidades');

  // Movimentação avulsa
  const [movementQty, setMovementQty] = useState('');
  const [movementType, setMovementType] = useState<StockMovementType>('perda_descarte');
  const [movementReason, setMovementReason] = useState('');

  // Contagem de inventário
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});
  const [inventoryNotes, setInventoryNotes] = useState('');

  const stockCategories: (StockCategory | 'Todas')[] = [
    'Todas',
    'Sorvetes de Massa',
    'Picolés',
    'Açaí & Copos',
    'Coberturas & Toppings',
    'Embalagens & Casquinhas',
    'Outros'
  ];

  // Contadores para os 3 cards do topo
  const totalCount = data.stockItems.length;
  const uncountedCount = data.stockItems.filter(i => !i.isCounted || i.currentQuantity === null).length;
  const lowStockCount = data.stockItems.filter(
    i => i.isCounted && i.currentQuantity !== null && i.currentQuantity <= i.minStock
  ).length;

  // Filtragem da tabela
  const filteredItems = data.stockItems.filter(item => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    const isLow = item.isCounted && item.currentQuantity !== null && item.currentQuantity <= item.minStock;
    const isUncounted = !item.isCounted || item.currentQuantity === null;

    let matchesStatus = true;
    if (selectedStatus === 'Normal') matchesStatus = !isLow && !isUncounted;
    if (selectedStatus === 'Estoque Baixo') matchesStatus = isLow;
    if (selectedStatus === 'Sem Contagem') matchesStatus = isUncounted;

    let matchesUnit = true;
    if (selectedUnit !== 'todas') {
      matchesUnit = item.unit === selectedUnit;
    }

    return matchesCategory && matchesSearch && matchesStatus && matchesUnit;
  });

  const handleOpenMovementForItem = (item: StockItem) => {
    setTargetItemForMovement(item);
    setIsMovementModalOpen(true);
  };

  const handleExecuteMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItemForMovement) return;
    const qty = parseFloat(movementQty);
    if (isNaN(qty) || qty === 0) return;

    const change =
      movementType === 'perda_descarte' || movementType === 'saida_venda' ? -Math.abs(qty) : Math.abs(qty);

    adjustStockQuantity(
      targetItemForMovement.id,
      change,
      movementType,
      movementReason || 'Movimentação avulsa registrada pelo operador'
    );

    setIsMovementModalOpen(false);
    setTargetItemForMovement(null);
    setMovementQty('');
    setMovementReason('');
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const unitCost = newItemCost ? parseFloat(newItemCost) || null : null;
    const itemsPerPkg = parseFloat(newItemItemsPerPackage) || 1;

    addStockItem({
      name: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      minStock: parseFloat(newItemMinStock) || 0,
      currentQuantity: newItemQty ? parseFloat(newItemQty) || 0 : null,
      isCounted: newItemQty !== '',
      unitCost,
      costStatus: unitCost !== null ? 'confirmed' : 'incomplete',
      itemsPerPackage: itemsPerPkg > 1 ? itemsPerPkg : undefined,
      packageUnitName: itemsPerPkg > 1 ? newItemPackageUnitName.trim() : undefined
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemCost('85.00');
    setNewItemItemsPerPackage('1');
    setNewItemPackageUnitName('unidades');
  };

  const handleOpenInventory = () => {
    const initial: Record<string, number> = {};
    data.stockItems.forEach(i => {
      initial[i.id] = i.currentQuantity ?? 0;
    });
    setInventoryCounts(initial);
    setIsInventoryModalOpen(true);
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    const counts = Object.entries(inventoryCounts).map(([stockItemId, countedQuantity]) => ({
      stockItemId,
      countedQuantity: Number(countedQuantity) || 0
    }));

    performPhysicalInventory(counts, inventoryNotes);
    setIsInventoryModalOpen(false);
    setInventoryNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Banner Superior com Ações (Fiel ao Print 2) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
            <Boxes className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Controle de Estoque e Insumos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contagem física, baixas automáticas por venda e controle de perdas e quebras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EAB308] hover:bg-[#CA8A04] text-slate-900 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Item no Estoque</span>
          </button>

          <button
            onClick={() => {
              setTargetItemForMovement(data.stockItems[0] || null);
              setIsMovementModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Movimentação Avulsa</span>
          </button>

          <button
            onClick={handleOpenInventory}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Contagem de Inventário</span>
          </button>
        </div>
      </div>

      {/* Faixa dos 3 Stat Cards (Fiel ao Print 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total de Itens Cadastrados */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Total de Itens Cadastrados
          </span>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalCount} itens
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Massas, picolés, açaí, embalagens e insumos
          </span>
        </div>

        {/* Card 2: Sem Contagem Inicial */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Sem Contagem Inicial
          </span>
          <div className="text-3xl font-bold font-mono text-[#C2410C] mt-1 tabular-nums">
            {uncountedCount} itens
          </div>
          <span className="text-[11px] text-[#C2410C]/80 mt-1 block">
            Aguardando primeira contagem física
          </span>
        </div>

        {/* Card 3: Estoque Baixo ou Crítico */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            Estoque Baixo ou Crítico
          </span>
          <div className="text-3xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            {lowStockCount} itens
          </div>
          <span className="text-[11px] text-rose-600/80 mt-1 block">
            Abaixo da margem mínima de segurança
          </span>
        </div>
      </div>

      {/* Abas Superiores: Itens de Estoque vs Histórico de Movimentações */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'items'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Itens de Estoque ({totalCount})
        </button>

        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'movements'
              ? 'bg-white border border-[#E7E5E4] text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Histórico de Movimentações ({data.stockMovements.length})
        </button>
      </div>

      {activeSubTab === 'items' ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 space-y-4 shadow-2xs">
          {/* Barra de Busca e Filtros Dropdown (Fiel ao Print 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar insumo, sabor ou embalagem..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as StockCategory | 'Todas')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                {stockCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'Todas' ? 'Todas as categorias' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedStatus}
                onChange={e =>
                  setSelectedStatus(e.target.value as 'Todos' | 'Normal' | 'Estoque Baixo' | 'Sem Contagem')
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="Todos">Todos os status</option>
                <option value="Normal">Normal</option>
                <option value="Estoque Baixo">Estoque Baixo</option>
                <option value="Sem Contagem">Sem Contagem</option>
              </select>
            </div>
          </div>

          {/* Filtro por Unidade de Medida */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap mr-1">Unidade:</span>
            {(
              [
                { id: 'todas', label: 'Todas' },
                { id: 'balde', label: 'Balde' },
                { id: 'caixa', label: 'Caixa' },
                { id: 'unidade', label: 'Unidade' },
                { id: 'kg', label: 'kg' },
                { id: 'litro', label: 'Litro' },
                { id: 'ml', label: 'ml' },
                { id: 'porção', label: 'Porção' },
                { id: 'pacote', label: 'Pacote' }
              ] as const
            ).map(u => {
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

          {/* Tabela de Insumos - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-semibold">Insumo / Produto</th>
                  <th className="pb-3 font-semibold">Categoria</th>
                  <th className="pb-3 font-semibold text-right">Saldo Atual</th>
                  <th className="pb-3 font-semibold text-right">Mínimo</th>
                  <th className="pb-3 font-semibold text-right">Custo de Compra</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const isLow =
                    item.isCounted &&
                    item.currentQuantity !== null &&
                    item.currentQuantity <= item.minStock;
                  const isUncounted = !item.isCounted || item.currentQuantity === null;
                  const stockDisplay = formatStockQuantityWithPackage(
                    item.currentQuantity,
                    item.unit,
                    item.itemsPerPackage,
                    item.packageUnitName
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3">
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatCurrency(item.unitCost)} por {item.unit}. Utilizado na operação.
                        </span>
                      </td>

                      <td className="py-3 text-slate-600 font-medium">
                        {item.category}
                      </td>

                      <td className="py-3 text-right font-mono font-bold tabular-nums">
                        {isUncounted ? (
                          <span className="text-amber-700 italic">Não contado</span>
                        ) : (
                          <div>
                            <span className={isLow ? 'text-rose-600' : 'text-slate-900'}>
                              {stockDisplay.mainText}
                            </span>
                            {stockDisplay.subText && (
                              <span className="text-[10px] text-slate-400 font-normal block font-sans">
                                {stockDisplay.subText}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 text-right font-mono text-slate-500 tabular-nums">
                        {item.minStock} {item.unit}
                      </td>

                      <td className="py-3 text-right font-mono text-slate-800 tabular-nums">
                        {item.unitCost !== null ? (
                          <div>
                            <span>{formatCurrency(item.unitCost)} / {item.unit}</span>
                            {item.itemsPerPackage && item.itemsPerPackage > 1 && (
                              <span className="text-[10px] text-slate-400 font-normal block font-sans">
                                ({formatCurrency(item.unitCost / item.itemsPerPackage)} / {item.packageUnitName || 'un'})
                              </span>
                            )}
                          </div>
                        ) : (
                          '(incompleto)'
                        )}
                      </td>

                      <td className="py-3 text-center">
                        {isUncounted ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-[#FEEAD2] px-2 py-0.5 rounded-md border border-[#FCD9B3]">
                            Sem Contagem
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Estoque Baixo
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenMovementForItem(item)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Movimentar
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Excluir"
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

          {/* Lista de Cards de Insumos - Mobile Native UX */}
          <div className="block md:hidden space-y-3">
            {filteredItems.map(item => {
              const isLow =
                item.isCounted &&
                item.currentQuantity !== null &&
                item.currentQuantity <= item.minStock;
              const isUncounted = !item.isCounted || item.currentQuantity === null;
              const stockDisplay = formatStockQuantityWithPackage(
                item.currentQuantity,
                item.unit,
                item.itemsPerPackage,
                item.packageUnitName
              );

              return (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                      <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                        {item.category}
                      </span>
                    </div>

                    <div>
                      {isUncounted ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-[#FEEAD2] px-2 py-1 rounded-lg border border-[#FCD9B3] whitespace-nowrap">
                          Sem Contagem
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 whitespace-nowrap">
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 whitespace-nowrap">
                          Normal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block">Saldo</span>
                      <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600' : isUncounted ? 'text-amber-700 italic' : 'text-slate-900'}`}>
                        {isUncounted ? 'Pendente' : stockDisplay.mainText}
                      </span>
                      {stockDisplay.subText && (
                        <span className="text-[9px] text-slate-400 font-sans block leading-tight">
                          {stockDisplay.subText}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block">Mínimo</span>
                      <span className="font-mono text-slate-700 text-xs">
                        {item.minStock} {item.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block">Custo Un.</span>
                      <span className="font-mono text-slate-800 text-xs">
                        {item.unitCost !== null ? formatCurrency(item.unitCost) : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenMovementForItem(item)}
                      className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
                      <span>Movimentar</span>
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="min-h-[40px] px-3.5 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Aba 2: Histórico de Movimentações */
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 space-y-4 shadow-2xs">
          {data.stockMovements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma movimentação de estoque registrada até o momento.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-semibold">Data / Hora</th>
                      <th className="pb-3 font-semibold">Insumo</th>
                      <th className="pb-3 font-semibold">Tipo</th>
                      <th className="pb-3 font-semibold text-right">Variação</th>
                      <th className="pb-3 font-semibold text-right">Saldo Resultante</th>
                      <th className="pb-3 font-semibold">Motivo / Justificativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.stockMovements.map(mov => {
                      const isPositive = mov.quantityChange > 0;
                      const dateFormatted = new Date(mov.timestamp).toLocaleString('pt-BR');

                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono text-slate-500">{dateFormatted}</td>
                          <td className="py-3 font-semibold text-slate-900">{mov.stockItemName}</td>
                          <td className="py-3 uppercase font-mono text-[10px] text-slate-600">
                            {mov.type.replace('_', ' ')}
                          </td>
                          <td
                            className={`py-3 text-right font-mono font-bold tabular-nums ${
                              isPositive ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-800 tabular-nums">
                            {mov.newQuantity !== null ? mov.newQuantity : '-'}
                          </td>
                          <td className="py-3 text-slate-600">{mov.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Stock Movements */}
              <div className="block md:hidden space-y-2.5">
                {data.stockMovements.map(mov => {
                  const isPositive = mov.quantityChange > 0;
                  const dateFormatted = new Date(mov.timestamp).toLocaleString('pt-BR');

                  return (
                    <div
                      key={mov.id}
                      className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-1.5 shadow-2xs text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{mov.stockItemName}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                          {mov.type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400 font-mono">{dateFormatted}</span>
                        <span
                          className={`font-mono font-bold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? `+${mov.quantityChange}` : mov.quantityChange} (Novo Saldo: {mov.newQuantity ?? '-'})
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 mt-1">
                        {mov.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal: Novo Item no Estoque */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Novo Item no Estoque
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Insumo / Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Balde Flocos 10L, Calda Caramelo..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as StockCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Sorvetes de Massa">Sorvetes de Massa</option>
                    <option value="Picolés">Picolés</option>
                    <option value="Açaí & Copos">Açaí & Copos</option>
                    <option value="Coberturas & Toppings">Coberturas & Toppings</option>
                    <option value="Embalagens & Casquinhas">Embalagens & Casquinhas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unidade
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value as StockUnit)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="balde">balde</option>
                    <option value="caixa">caixa</option>
                    <option value="unidade">unidade</option>
                    <option value="kg">kg</option>
                    <option value="litro">litro</option>
                    <option value="pacote">pacote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItemMinStock}
                    onChange={e => setNewItemMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qtd. Atual
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Vazio p/ s/ contagem"
                    value={newItemQty}
                    onChange={e => setNewItemQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemCost}
                    onChange={e => setNewItemCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Opções de Rendimento da Embalagem / Caixa */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-[11px] block">
                  Conteúdo / Rendimento por Embalagem (Opcional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Unidades por Caixa/Pacote
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Ex: 100 copos por caixa"
                      value={newItemItemsPerPackage}
                      onChange={e => setNewItemItemsPerPackage(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Nome da Unidade Individual
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: copos, tampas, casquinhas"
                      value={newItemPackageUnitName}
                      onChange={e => setNewItemPackageUnitName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
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
                  className="px-4 py-2 bg-[#EAB308] hover:bg-[#CA8A04] text-slate-900 font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Cadastrar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Movimentação Avulsa */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Movimentação Avulsa
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Insumo Selecionado *
                </label>
                <select
                  required
                  value={targetItemForMovement?.id || ''}
                  onChange={e => {
                    const found = data.stockItems.find(s => s.id === e.target.value);
                    setTargetItemForMovement(found || null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                >
                  {data.stockItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.currentQuantity ?? 'Sem contagem'} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Operação *
                  </label>
                  <select
                    value={movementType}
                    onChange={e => setMovementType(e.target.value as StockMovementType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="perda_descarte">Perda / Descarte (Saída)</option>
                    <option value="movimentacao_avulsa">Entrada Manual</option>
                    <option value="ajuste_inventario">Ajuste Operacional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="Ex: 2"
                    value={movementQty}
                    onChange={e => setMovementQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo / Justificativa *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Derretimento por desligamento do freezer de massa, vencimento..."
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Registrar Movimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contagem Física de Inventário */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Contagem de Inventário
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha os saldos reais contados fisicamente nos freezers e depósitos
                </p>
              </div>
              <button onClick={() => setIsInventoryModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="flex-1 flex flex-col min-h-0 space-y-3.5">
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {data.stockItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {item.category} · Unidade: {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Saldo Contado:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={inventoryCounts[item.id] ?? ''}
                        onChange={e =>
                          setInventoryCounts({
                            ...inventoryCounts,
                            [item.id]: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações da Contagem
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fechamento semanal de domingo, conferência total dos baldes..."
                  value={inventoryNotes}
                  onChange={e => setInventoryNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Inventário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-rose-200 p-6 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Remover Insumo?
              </h3>
              <p className="text-xs text-slate-600">
                Deseja excluir definitivamente <strong>{itemToDelete.name}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteStockItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
