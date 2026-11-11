import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Product, ProductCategory, StockUnit } from '../types';
import { formatCurrency, formatPercentage, calculateProductEffectiveUnitCost } from '../utils/deterministicMath';
import { EditProductModal } from '../components/EditProductModal';

export const MenuAndCostsPage: React.FC = () => {
  const { data, addProduct, updateProduct, deleteProduct } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [selectedUnit, setSelectedUnit] = useState<StockUnit | 'todas'>('todas');

  // Modal de edição e criação
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Confirmação de exclusão rápida
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Categorias
  const categories: (ProductCategory | 'Todos')[] = [
    'Todos',
    'Sorvetes de Massa',
    'Picolés',
    'Açaí & Copos',
    'Outros'
  ];

  // Unidades de medida
  const unitsList: { id: StockUnit | 'todas'; label: string }[] = [
    { id: 'todas', label: 'Todas as Unidades' },
    { id: 'balde', label: 'Balde' },
    { id: 'unidade', label: 'Unidade' },
    { id: 'porção', label: 'Porção' },
    { id: 'ml', label: 'ml' },
    { id: 'litro', label: 'Litro' },
    { id: 'kg', label: 'kg' },
    { id: 'caixa', label: 'Caixa' }
  ];

  const filteredProducts = data.products.filter(p => {
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesUnit = true;
    if (selectedUnit !== 'todas') {
      const pUnit = p.unit || (p.category === 'Sorvetes de Massa' ? 'porção' : 'unidade');
      matchesUnit = pUnit === selectedUnit;
    }

    return matchesCat && matchesSearch && matchesUnit;
  });

  const handleOpenNewProduct = () => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      category: 'Sorvetes de Massa',
      unit: 'porção',
      salePrice: 10.0,
      active: true,
      hasRecipe: false,
      directUnitCost: 2.5,
      costStatus: 'confirmed',
      portionLabel: '1 porção'
    };
    setEditingProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleSaveProductModal = (product: Product) => {
    const exists = data.products.some(p => p.id === product.id);
    if (exists) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Banner Superior com Botão Novo Item (Fiel ao Print 3) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Cardápio, Preços e Fichas de Custo (CMV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo de margens brutas determinísticas sem inventar números quando faltar informação
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewProduct}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C2410C] hover:bg-[#B43A08] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Item no Cardápio</span>
        </button>
      </div>

      {/* Barra de Busca e Filtros de Categoria e Unidades */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar item do cardápio..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map(cat => {
              const count =
                cat === 'Todos'
                  ? data.products.length
                  : data.products.filter(p => p.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat} {cat === 'Todos' ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pílulas de Unidade de Medida */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap mr-1">Filtrar por Formato:</span>
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

      {/* Grid de 3 Colunas de Cards (Fiel ao Print 3) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-slate-400 text-xs shadow-2xs">
          Nenhum item do cardápio cadastrado com os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(prod => {
            const effectiveCost = calculateProductEffectiveUnitCost(prod, data.stockItems);
            const hasCost = effectiveCost !== null && effectiveCost !== undefined;
            const profit = hasCost ? prod.salePrice - effectiveCost : null;
            const margin =
              hasCost && prod.salePrice > 0
                ? ((prod.salePrice - effectiveCost) / prod.salePrice) * 100
                : null;
            const prodUnit = prod.unit || (prod.category === 'Sorvetes de Massa' ? 'porção' : 'unidade');
            const recipeCount = prod.recipeItems ? prod.recipeItems.length : 0;

            return (
              <div
                key={prod.id}
                className="bg-white border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:border-amber-300 transition-colors"
              >
                <div>
                  {/* Topo do Card: Categoria, Formato e Botões de Edição/Exclusão */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider block">
                          {prod.category}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                          {prodUnit}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 leading-tight">
                        {prod.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {prod.portionLabel || '1 porção'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar Ficha Técnica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Item do Cardápio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2 Caixas Lado a Lado: Preço de Venda e Custo Unitário */}
                  <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Preço de Venda</span>
                      <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                        {formatCurrency(prod.salePrice)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Custo Unitário (CMV)</span>
                      {hasCost ? (
                        <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                          {formatCurrency(effectiveCost)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 mt-0.5 block">
                          Custo incompleto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Métricas de Lucro e Margem */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lucro Bruto Unitário:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {profit !== null ? formatCurrency(profit) : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Margem Bruta Estimada:</span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {margin !== null ? formatPercentage(margin) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Detalhamento dos Insumos da Ficha Técnica */}
                  {prod.recipeItems && prod.recipeItems.length > 0 ? (
                    <div className="mt-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 space-y-1">
                      <span className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider block">
                        Ficha Técnica ({recipeCount} insumos)
                      </span>
                      <div className="space-y-0.5 text-[11px] text-slate-700">
                        {prod.recipeItems.map((ritem, ridx) => {
                          const stock = data.stockItems.find(s => s.id === ritem.stockItemId);
                          return (
                            <div key={ridx} className="flex items-center justify-between font-medium">
                              <span className="truncate pr-1">• {ritem.quantity} {stock?.unit || ritem.unit} {stock?.name || ritem.stockItemName}</span>
                              <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                {formatCurrency(ritem.quantity * (stock?.unitCost ?? ritem.unitCost))}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Revenda direta ou item sem receita</span>
                      </div>
                    </div>
                  )}

                  {/* Nota sobre embalagem / custo */}
                  {prod.costNote && (
                    <p className="text-[11px] text-slate-400 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {prod.costNote}
                    </p>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {recipeCount > 0 ? `${recipeCount} insumos vinculados` : 'Sem ficha técnica'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#C2410C] hover:underline cursor-pointer"
                  >
                    Editar Ficha Técnica
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Fiel ao Print 5 */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProductModal}
        onDelete={id => {
          deleteProduct(id);
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
      />

      {/* Modal Confirmação de Exclusão do Cardápio */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Item do Cardápio
                </h3>
                <span className="text-xs text-rose-600 font-semibold">
                  Remoção definitiva
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja realmente remover o produto{' '}
              <strong className="text-slate-900 font-bold">&quot;{productToDelete.name}&quot;</strong> do cardápio?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm cursor-pointer text-xs"
              >
                Sim, Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
