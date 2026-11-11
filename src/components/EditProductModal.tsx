import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, AlertTriangle, Trash2 } from 'lucide-react';
import { Product, ProductCategory, StockUnit } from '../types';
import { formatCurrency, formatPercentage } from '../utils/deterministicMath';

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
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Sorvetes de Massa');
  const [unit, setUnit] = useState<StockUnit>('unidade');
  const [salePrice, setSalePrice] = useState('7.00');
  const [active, setActive] = useState(true);
  const [portionLabel, setPorçãoLabel] = useState('1');
  const [hasRecipe, setHasRecipe] = useState(false);
  const [directUnitCost, setDirectUnitCost] = useState('1.80');
  const [costNote, setCostNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setUnit(product.unit || (product.category === 'Sorvetes de Massa' ? 'porção' : 'unidade'));
      setSalePrice(product.salePrice.toString());
      setActive(product.active);
      setPorçãoLabel(product.portionLabel || '1');
      setHasRecipe(product.hasRecipe);
      setDirectUnitCost(product.directUnitCost !== null ? product.directUnitCost.toString() : '');
      setCostNote(product.costNote || '');
      setShowDeleteConfirm(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const priceNum = parseFloat(salePrice) || 0;
  const costNum = directUnitCost !== '' ? parseFloat(directUnitCost) || 0 : null;
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
      hasRecipe,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ficha Técnica do Cardápio
              </h2>
              <p className="text-xs text-slate-500">
                Fórmula explícita de custo e cálculo de margem sem números inventados
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unidade de Medida *
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as StockUnit)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
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
              <label className="block font-semibold text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              >
                <option value="Sorvetes de Massa">Sorvetes de Massa</option>
                <option value="Picolés">Picolés</option>
                <option value="Açaí & Copos">Açaí & Copos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Porção / Apresentação
              </label>
              <input
                type="text"
                placeholder="Ex: 1 bola (60g)"
                value={portionLabel}
                onChange={e => setPorçãoLabel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Checkbox Ficha Técnica */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="hasRecipe"
                checked={hasRecipe}
                onChange={e => setHasRecipe(e.target.checked)}
                className="mt-0.5 rounded text-[#C2410C] focus:ring-[#C2410C]"
              />
              <label htmlFor="hasRecipe" className="cursor-pointer">
                <span className="font-semibold text-slate-900 block">
                  Possui Ficha Técnica / Receita Fracionada?
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Desmarque para porções prontas (picolés, taças simples) ou produtos de revenda direta.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Custo Unitário da Porção Pronta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Vazio para incompleto"
                  value={directUnitCost}
                  onChange={e => setDirectUnitCost(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nota sobre embalagem / custo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Caixa com 24 por R$ 70,00"
                  value={costNote}
                  onChange={e => setCostNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Métricas Calculadas */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100/80 rounded-xl text-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Custo Unitário (CMV):</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {costNum !== null ? formatCurrency(costNum) : 'Custo incompleto'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Lucro Bruto Unitário:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {grossProfit !== null ? formatCurrency(grossProfit) : '-'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Margem Bruta Estimada:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
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
                  className="px-2.5 py-1 text-slate-600 bg-white rounded border border-slate-200 hover:bg-slate-50"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-2.5 py-1 text-white bg-rose-600 rounded hover:bg-rose-700 font-bold"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          ) : null}

          {/* Ações */}
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
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Salvar Produto e Ficha Técnica
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
