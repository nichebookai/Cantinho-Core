import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, Plus, Trash2, Layers } from 'lucide-react';
import { Product, ProductCategory, StockUnit, RecipeItem } from '../types';
import { formatCurrency, formatPercentage } from '../utils/deterministicMath';
import { useBusiness } from '../context/BusinessContext';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { data } = useBusiness();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Sorvetes de Massa');
  const [unit, setUnit] = useState<StockUnit>('unidade');
  const [salePrice, setSalePrice] = useState('7.00');
  const [active, setActive] = useState(true);
  const [portionLabel, setPorçãoLabel] = useState('1');
  const [hasRecipe, setHasRecipe] = useState(false);
  const [directUnitCost, setDirectUnitCost] = useState('1.80');
  const [costNote, setCostNote] = useState('');
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setUnit(product.unit || (product.category === 'Sorvetes de Massa' ? 'porção' : 'unidade'));
      setSalePrice(product.salePrice.toString());
      setActive(product.active);
      setPorçãoLabel(product.portionLabel || '1');
      setHasRecipe(product.hasRecipe || (product.recipeItems && product.recipeItems.length > 0) || false);
      setDirectUnitCost(product.directUnitCost !== null ? product.directUnitCost.toString() : '');
      setCostNote(product.costNote || '');
      setRecipeItems(product.recipeItems ? [...product.recipeItems] : []);
      setShowDeleteConfirm(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Adicionar linha de insumo na receita
  const handleAddRecipeItem = () => {
    const firstStock = data.stockItems[0];
    if (!firstStock) return;

    setRecipeItems(prev => [
      ...prev,
      {
        stockItemId: firstStock.id,
        stockItemName: firstStock.name,
        quantity: 1,
        unit: firstStock.unit,
        unitCost: firstStock.unitCost ?? 0
      }
    ]);
  };

  // Alterar insumo selecionado na receita
  const handleRecipeStockChange = (index: number, stockItemId: string) => {
    const stock = data.stockItems.find(s => s.id === stockItemId);
    if (!stock) return;

    setRecipeItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            stockItemId: stock.id,
            stockItemName: stock.name,
            unit: stock.unit,
            unitCost: stock.unitCost ?? 0
          };
        }
        return item;
      })
    );
  };

  // Alterar quantidade do insumo na receita
  const handleRecipeQtyChange = (index: number, qty: number) => {
    setRecipeItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            quantity: Math.max(0.0001, qty)
          };
        }
        return item;
      })
    );
  };

  // Remover insumo da receita
  const handleRemoveRecipeItem = (index: number) => {
    setRecipeItems(prev => prev.filter((_, i) => i !== index));
  };

  // Cálculo dinâmico do custo total da receita
  const calculatedRecipeCost = recipeItems.reduce((sum, item) => {
    const stock = data.stockItems.find(s => s.id === item.stockItemId);
    const cost = stock?.unitCost ?? item.unitCost;
    return sum + item.quantity * cost;
  }, 0);

  const priceNum = parseFloat(salePrice) || 0;
  const costNum =
    recipeItems.length > 0
      ? calculatedRecipeCost
      : directUnitCost !== ''
      ? parseFloat(directUnitCost) || 0
      : null;

  const grossProfit = costNum !== null ? priceNum - costNum : null;
  const grossMargin = costNum !== null && priceNum > 0 ? (grossProfit! / priceNum) * 100 : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...product,
      name: name.trim(),
      category,
      unit,
      salePrice: priceNum,
      active,
      portionLabel: portionLabel.trim() || undefined,
      hasRecipe: recipeItems.length > 0 || hasRecipe,
      recipeItems,
      directUnitCost: costNum,
      costStatus: costNum !== null ? 'confirmed' : 'incomplete',
      costNote: costNote.trim() || undefined
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    if (onDelete && product.id) {
      onDelete(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-[#C2410C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Ficha Técnica do Cardápio
              </h2>
              <p className="text-[11px] text-slate-500">
                Vínculo com o estoque para baixa automática e cálculo de custo (CMV)
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Unidade de Medida *
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as StockUnit)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
              >
                <option value="porção">Porção</option>
                <option value="unidade">Unidade</option>
                <option value="balde">Balde</option>
                <option value="ml">ml</option>
                <option value="litro">Litro</option>
                <option value="kg">kg</option>
                <option value="caixa">Caixa</option>
                <option value="pacote">Pacote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
              >
                <option value="Sorvetes de Massa">Sorvetes de Massa</option>
                <option value="Picolés">Picolés</option>
                <option value="Açaí & Copos">Açaí & Copos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Apresentação / Porção
              </label>
              <input
                type="text"
                placeholder="Ex: Copo 500ml + Tampa + Colher"
                value={portionLabel}
                onChange={e => setPorçãoLabel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
          </div>

          {/* Seção Ficha Técnica / Insumos do Estoque */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/90 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C2410C]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">
                    Insumos da Ficha Técnica (Consumo por Venda)
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    Copos (300ml/500ml), tampas, colheres, caldas e bases de sorvete/açaí
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddRecipeItem}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#C2410C] hover:bg-[#B43A08] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Insumo do Estoque</span>
              </button>
            </div>

            {/* Lista de Insumos da Receita */}
            {recipeItems.length === 0 ? (
              <div className="text-center py-4 text-slate-500 bg-white/70 border border-amber-200/50 rounded-xl text-xs space-y-1">
                <span className="font-semibold block">Nenhum insumo específico vinculado ainda.</span>
                <span className="text-[11px] text-slate-400 block">
                  Clique em &quot;Adicionar Insumo do Estoque&quot; acima para incluir copos (300ml, 500ml), tampas, massa ou toppings.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {recipeItems.map((item, idx) => {
                  const stock = data.stockItems.find(s => s.id === item.stockItemId);
                  const currentStockCost = stock?.unitCost ?? item.unitCost;
                  const lineTotalCost = item.quantity * currentStockCost;

                  return (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      {/* Seleção do Item do Estoque */}
                      <div className="sm:col-span-5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                          Insumo do Estoque
                        </label>
                        <select
                          value={item.stockItemId}
                          onChange={e => handleRecipeStockChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs"
                        >
                          {data.stockItems.map(st => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantidade Consumida */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                          Qtd por Venda ({stock?.unit || item.unit})
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.0001"
                          required
                          value={item.quantity}
                          onChange={e => handleRecipeQtyChange(idx, parseFloat(e.target.value) || 0.001)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-xs"
                        />
                      </div>

                      {/* Custo Parcial da Linha */}
                      <div className="sm:col-span-3 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Custo do Insumo</span>
                        <span className="font-mono font-bold text-slate-900 text-xs block">
                          {formatCurrency(lineTotalCost)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          ({formatCurrency(currentStockCost)}/{stock?.unit || item.unit})
                        </span>
                      </div>

                      {/* Remover Insumo */}
                      <div className="sm:col-span-1 text-center flex sm:justify-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipeItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover insumo da receita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custo Direto Alternativo caso sem Ficha */}
            {recipeItems.length === 0 && (
              <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custo Direto Estimado por Porção (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1.80"
                    value={directUnitCost}
                    onChange={e => setDirectUnitCost(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nota sobre Custo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Caixa com 24 unidades"
                    value={costNote}
                    onChange={e => setCostNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resumo Financeiro da Ficha Técnica */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-900 text-white rounded-2xl text-center shadow-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Custo Total (CMV)</span>
              <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                {costNum !== null ? formatCurrency(costNum) : 'Incompleto'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Lucro Bruto</span>
              <span className="font-mono font-bold text-white text-sm tabular-nums">
                {grossProfit !== null ? formatCurrency(grossProfit) : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Margem Bruta</span>
              <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                {grossMargin !== null ? formatPercentage(grossMargin) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Confirmação de exclusão integrada */}
          {showDeleteConfirm ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <span className="text-xs text-rose-800 font-semibold">
                Tem certeza que deseja apagar este item do cardápio?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 text-slate-600 bg-white rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-2.5 py-1 text-white bg-rose-600 rounded hover:bg-rose-700 font-bold cursor-pointer"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          ) : null}

          {/* Ações do Modal */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              {onDelete && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Produto</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Salvar Ficha Técnica
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
