import { BusinessData, Product, StockItem } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-sorvete-bola',
    name: 'Bola de Sorvete (Taça/Casquinha)',
    category: 'Sorvetes de Massa',
    unit: 'porção',
    salePrice: 7.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 1.80,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-sorvete-chocolate-10l',
    linkedPackagingStockItemId: 'stock-casquinha-simples',
    portionSize: 1,
    description: '1 bola servida na casquinha artesanal crocante ou copinho'
  },
  {
    id: 'prod-cascao-duplo',
    name: 'Cascão Recheado com 2 Bolas',
    category: 'Sorvetes de Massa',
    unit: 'porção',
    salePrice: 15.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 4.10,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-sorvete-chocolate-10l',
    linkedPackagingStockItemId: 'stock-cascao-especial',
    portionSize: 2,
    description: 'Cascão com borda trufada de chocolate e 2 bolas à escolha'
  },
  {
    id: 'prod-picole-fruta',
    name: 'Picolé de Fruta (Variados)',
    category: 'Picolés',
    unit: 'unidade',
    salePrice: 4.00,
    active: true,
    hasRecipe: false,
    directUnitCost: 1.10,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-picole-fruta-cx',
    portionSize: 1,
    description: 'Sabores naturais: limão siciliano, maracujá, uva e morango'
  },
  {
    id: 'prod-picole-skimo',
    name: 'Picolé Trufado / Skimo Especial',
    category: 'Picolés',
    unit: 'unidade',
    salePrice: 7.50,
    active: true,
    hasRecipe: false,
    directUnitCost: 2.40,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-picole-skimo-cx',
    portionSize: 1,
    description: 'Cremoso de baunilha com banho crocante de chocolate'
  },
  {
    id: 'prod-acai-300ml',
    name: 'Copo de Açaí 300ml',
    category: 'Açaí & Copos',
    unit: 'ml',
    salePrice: 14.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 4.20,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-acai-caixa-10l',
    linkedPackagingStockItemId: 'stock-copo-300ml',
    portionSize: 1,
    description: 'Açaí puro batido com 2 acompanhamentos inclusos'
  },
  {
    id: 'prod-acai-500ml',
    name: 'Copo de Açaí 500ml c/ 3 Toppings',
    category: 'Açaí & Copos',
    unit: 'ml',
    salePrice: 18.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 5.50,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-acai-caixa-10l',
    linkedPackagingStockItemId: 'stock-copo-500ml',
    portionSize: 1,
    description: 'Porção generosa de 500ml com leite em pó, morango e calda'
  },
  {
    id: 'prod-pote-1l-levar',
    name: 'Pote 1 Litro para Viagem',
    category: 'Sorvetes de Massa',
    unit: 'litro',
    salePrice: 32.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 11.20,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-sorvete-chocolate-10l',
    linkedPackagingStockItemId: 'stock-pote-viagem-1l',
    portionSize: 1,
    description: 'Embalagem térmica selada com até 2 sabores para levar'
  },
  {
    id: 'prod-agua-mineral',
    name: 'Água Mineral 500ml (s/ gás)',
    category: 'Outros',
    unit: 'unidade',
    salePrice: 4.00,
    active: true,
    hasRecipe: false,
    directUnitCost: 1.20,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-agua-500ml',
    portionSize: 1,
    description: 'Garrafa individual de 500ml resfriada'
  }
];

export const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: 'stock-sorvete-chocolate-10l',
    name: 'Balde Sorvete Chocolate Belga 10L',
    category: 'Sorvetes de Massa',
    unit: 'balde',
    minStock: 2,
    currentQuantity: 4,
    isCounted: true,
    unitCost: 85.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-sorvete-morango-10l',
    name: 'Balde Sorvete Morango Silvestre 10L',
    category: 'Sorvetes de Massa',
    unit: 'balde',
    minStock: 2,
    currentQuantity: 3,
    isCounted: true,
    unitCost: 82.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-sorvete-pistache-10l',
    name: 'Balde Sorvete Pistache Puro 10L',
    category: 'Sorvetes de Massa',
    unit: 'balde',
    minStock: 2,
    currentQuantity: 1, // Estoque baixo para exibir alerta
    isCounted: true,
    unitCost: 115.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-picole-fruta-cx',
    name: 'Picolé de Fruta (Caixa c/ 24 un)',
    category: 'Picolés',
    unit: 'caixa',
    minStock: 3,
    currentQuantity: 5,
    isCounted: true,
    unitCost: 26.40,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-picole-skimo-cx',
    name: 'Picolé Skimo Trufado (Caixa c/ 20 un)',
    category: 'Picolés',
    unit: 'caixa',
    minStock: 2,
    currentQuantity: 4,
    isCounted: true,
    unitCost: 48.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-acai-caixa-10l',
    name: 'Caixa de Açaí Tradicional 10L',
    category: 'Açaí & Copos',
    unit: 'caixa',
    minStock: 2,
    currentQuantity: 5,
    isCounted: true,
    unitCost: 110.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-casquinha-simples',
    name: 'Casquinha de Sorvete (Caixa c/ 300)',
    category: 'Embalagens & Casquinhas',
    unit: 'caixa',
    minStock: 1,
    currentQuantity: 2,
    isCounted: true,
    unitCost: 45.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-cascao-especial',
    name: 'Cascão Crocante (Caixa c/ 120)',
    category: 'Embalagens & Casquinhas',
    unit: 'caixa',
    minStock: 2,
    currentQuantity: 1, // Estoque baixo
    isCounted: true,
    unitCost: 52.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-copo-300ml',
    name: 'Copos Cristal 300ml (Pacote c/ 100)',
    category: 'Embalagens & Casquinhas',
    unit: 'pacote',
    minStock: 2,
    currentQuantity: 4,
    isCounted: true,
    unitCost: 24.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-copo-500ml',
    name: 'Copos Cristal 500ml (Pacote c/ 100)',
    category: 'Embalagens & Casquinhas',
    unit: 'pacote',
    minStock: 2,
    currentQuantity: 3,
    isCounted: true,
    unitCost: 32.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-pote-viagem-1l',
    name: 'Pote Térmico Viagem 1L c/ Tampa (Pct c/ 50)',
    category: 'Embalagens & Casquinhas',
    unit: 'pacote',
    minStock: 2,
    currentQuantity: null, // Sem contagem inicial para acionar badge
    isCounted: false,
    unitCost: 46.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-leite-ninho-topping',
    name: 'Leite em Pó Topping (Pacote 1kg)',
    category: 'Coberturas & Toppings',
    unit: 'kg',
    minStock: 2,
    currentQuantity: null, // Sem contagem inicial
    isCounted: false,
    unitCost: 36.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-calda-morango',
    name: 'Calda de Morango Topping (Frasco 1.2kg)',
    category: 'Coberturas & Toppings',
    unit: 'unidade',
    minStock: 1,
    currentQuantity: 2,
    isCounted: true,
    unitCost: 22.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-calda-chocolate-artesanal',
    name: 'Calda Chocolate Artesanal (Frasco 2kg)',
    category: 'Coberturas & Toppings',
    unit: 'unidade',
    minStock: 2,
    currentQuantity: null, // Sem contagem inicial
    isCounted: false,
    unitCost: 38.00,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-agua-500ml',
    name: 'Fardo Água Mineral 500ml c/ 12un',
    category: 'Outros',
    unit: 'pacote',
    minStock: 2,
    currentQuantity: 5,
    isCounted: true,
    unitCost: 14.40,
    costStatus: 'confirmed'
  }
];

// Dados limpos de vendas e finanças (zerados conforme solicitado pelo usuário)
export const DEFAULT_INITIAL_DATA: BusinessData = {
  version: '1.0.0',
  settings: {
    businessName: 'Cantinho Gelado',
    document: '12.345.678/0001-90',
    defaultCashDrawerOpening: 0,
    currencySymbol: 'R$',
    lowStockThresholdAlert: true
  },
  products: INITIAL_PRODUCTS,
  stockItems: INITIAL_STOCK_ITEMS,
  sales: [],
  stockMovements: [],
  financialEntries: [],
  cashClosures: [],
  purchases: []
};
