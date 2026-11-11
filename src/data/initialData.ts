import { BusinessData, Product, StockItem } from '../types';

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
    currentQuantity: 1, // Estoque baixo
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
    name: 'Copos Cristal 300ml (Unidade)',
    category: 'Embalagens & Casquinhas',
    unit: 'unidade',
    minStock: 50,
    currentQuantity: 200,
    isCounted: true,
    unitCost: 0.25,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-copo-500ml',
    name: 'Copos Cristal 500ml (Unidade)',
    category: 'Embalagens & Casquinhas',
    unit: 'unidade',
    minStock: 50,
    currentQuantity: 150,
    isCounted: true,
    unitCost: 0.35,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-tampa-copo',
    name: 'Tampas Bolha p/ Copos (Unidade)',
    category: 'Embalagens & Casquinhas',
    unit: 'unidade',
    minStock: 50,
    currentQuantity: 300,
    isCounted: true,
    unitCost: 0.15,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-colher-descartavel',
    name: 'Colheres Reforçadas (Unidade)',
    category: 'Embalagens & Casquinhas',
    unit: 'unidade',
    minStock: 50,
    currentQuantity: 500,
    isCounted: true,
    unitCost: 0.08,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-pote-viagem-1l',
    name: 'Pote Térmico Viagem 1L c/ Tampa (Unidade)',
    category: 'Embalagens & Casquinhas',
    unit: 'unidade',
    minStock: 20,
    currentQuantity: 80,
    isCounted: true,
    unitCost: 1.20,
    costStatus: 'confirmed'
  },
  {
    id: 'stock-leite-ninho-topping',
    name: 'Leite em Pó Topping (Pacote 1kg)',
    category: 'Coberturas & Toppings',
    unit: 'kg',
    minStock: 2,
    currentQuantity: 3,
    isCounted: true,
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
    id: 'stock-agua-500ml',
    name: 'Garrafa Água Mineral 500ml',
    category: 'Outros',
    unit: 'unidade',
    minStock: 24,
    currentQuantity: 60,
    isCounted: true,
    unitCost: 1.20,
    costStatus: 'confirmed'
  }
];

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
    portionLabel: '1 bola servida na casquinha ou copinho',
    recipeItems: [
      {
        stockItemId: 'stock-sorvete-chocolate-10l',
        stockItemName: 'Balde Sorvete Chocolate Belga 10L',
        quantity: 0.01,
        unit: 'balde',
        unitCost: 85.00
      },
      {
        stockItemId: 'stock-casquinha-simples',
        stockItemName: 'Casquinha de Sorvete (Caixa c/ 300)',
        quantity: 0.0033,
        unit: 'caixa',
        unitCost: 45.00
      }
    ]
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
    portionLabel: 'Cascão recheado + 2 bolas',
    recipeItems: [
      {
        stockItemId: 'stock-sorvete-chocolate-10l',
        stockItemName: 'Balde Sorvete Chocolate Belga 10L',
        quantity: 0.02,
        unit: 'balde',
        unitCost: 85.00
      },
      {
        stockItemId: 'stock-cascao-especial',
        stockItemName: 'Cascão Crocante (Caixa c/ 120)',
        quantity: 0.0083,
        unit: 'caixa',
        unitCost: 52.00
      }
    ]
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
    portionLabel: 'Sabores naturais: limão, maracujá, uva e morango'
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
    portionLabel: 'Cremoso com casquinha de chocolate'
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
    portionLabel: 'Copo 300ml + Tampa + Colher + Açaí',
    recipeItems: [
      {
        stockItemId: 'stock-copo-300ml',
        stockItemName: 'Copos Cristal 300ml (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 0.25
      },
      {
        stockItemId: 'stock-tampa-copo',
        stockItemName: 'Tampas Bolha p/ Copos (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 0.15
      },
      {
        stockItemId: 'stock-colher-descartavel',
        stockItemName: 'Colheres Reforçadas (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 0.08
      },
      {
        stockItemId: 'stock-acai-caixa-10l',
        stockItemName: 'Caixa de Açaí Tradicional 10L',
        quantity: 0.03,
        unit: 'caixa',
        unitCost: 110.00
      }
    ]
  },
  {
    id: 'prod-acai-500ml',
    name: 'Copo de Açaí 500ml c/ Toppings',
    category: 'Açaí & Copos',
    unit: 'ml',
    salePrice: 18.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 5.86,
    costStatus: 'confirmed',
    portionLabel: 'Copo 500ml + Tampa + Colher + Açaí + Leite em Pó',
    recipeItems: [
      {
        stockItemId: 'stock-copo-500ml',
        stockItemName: 'Copos Cristal 500ml (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 0.35
      },
      {
        stockItemId: 'stock-tampa-copo',
        stockItemName: 'Tampas Bolha p/ Copos (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 0.15
      },
      {
        stockItemId: 'stock-colher-descartavel',
        stockItemName: 'Colheres Reforçadas (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 0.08
      },
      {
        stockItemId: 'stock-acai-caixa-10l',
        stockItemName: 'Caixa de Açaí Tradicional 10L',
        quantity: 0.04,
        unit: 'caixa',
        unitCost: 110.00
      },
      {
        stockItemId: 'stock-leite-ninho-topping',
        stockItemName: 'Leite em Pó Topping (Pacote 1kg)',
        quantity: 0.02,
        unit: 'kg',
        unitCost: 36.00
      }
    ]
  },
  {
    id: 'prod-pote-1l-levar',
    name: 'Pote 1 Litro para Viagem',
    category: 'Sorvetes de Massa',
    unit: 'litro',
    salePrice: 32.00,
    active: true,
    hasRecipe: true,
    directUnitCost: 9.70,
    costStatus: 'confirmed',
    portionLabel: 'Pote térmico 1L + Sorvete de Massa',
    recipeItems: [
      {
        stockItemId: 'stock-pote-viagem-1l',
        stockItemName: 'Pote Térmico Viagem 1L c/ Tampa (Unidade)',
        quantity: 1,
        unit: 'unidade',
        unitCost: 1.20
      },
      {
        stockItemId: 'stock-sorvete-chocolate-10l',
        stockItemName: 'Balde Sorvete Chocolate Belga 10L',
        quantity: 0.1,
        unit: 'balde',
        unitCost: 85.00
      }
    ]
  },
  {
    id: 'prod-agua-mineral',
    name: 'Água Mineral 500ml',
    category: 'Outros',
    unit: 'unidade',
    salePrice: 4.00,
    active: true,
    hasRecipe: false,
    directUnitCost: 1.20,
    costStatus: 'confirmed',
    linkedStockItemId: 'stock-agua-500ml',
    portionLabel: 'Garrafa 500ml resfriada'
  }
];

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
