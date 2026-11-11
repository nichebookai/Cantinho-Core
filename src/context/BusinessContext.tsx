import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  BusinessData,
  Product,
  StockItem,
  Sale,
  StockMovement,
  FinancialEntry,
  CashClosure,
  Purchase,
  BusinessSettings,
  StockMovementType,
  PaymentMethod,
  FinancialStatus,
  TimeFilter,
  SaleChannel
} from '../types';
import { DEFAULT_INITIAL_DATA } from '../data/initialData';
import { calculateDeterministicFinancials, DeterministicFinancialSummary } from '../utils/deterministicMath';

const STORAGE_KEY = 'sorveteria_business_data_v2';

interface BusinessContextType {
  data: BusinessData;
  summary: DeterministicFinancialSummary;
  timeFilter: TimeFilter;
  selectedDate: string;
  setTimeFilter: (filter: TimeFilter) => void;
  setSelectedDate: (date: string) => void;
  // Produtos & Cardápio
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  // Estoque
  addStockItem: (item: Omit<StockItem, 'id'>) => StockItem;
  updateStockItem: (item: StockItem) => void;
  deleteStockItem: (id: string) => void;
  adjustStockQuantity: (
    stockItemId: string,
    quantityChange: number,
    type: StockMovementType,
    reason: string,
    referenceId?: string
  ) => void;
  performPhysicalInventory: (
    counts: { stockItemId: string; countedQuantity: number }[],
    notes?: string
  ) => void;
  // Vendas / PDV
  createSale: (
    items: { product: Product; quantity: number }[],
    paymentMethod: PaymentMethod,
    channel?: SaleChannel,
    notes?: string,
    amountPaid?: number,
    discount?: number,
    saleDateTime?: string
  ) => { success: boolean; sale?: Sale; error?: string };
  cancelSale: (saleId: string, reason: string) => { success: boolean; error?: string };
  // Financeiro
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id' | 'timestamp'>) => FinancialEntry;
  updateFinancialEntry: (entry: FinancialEntry) => void;
  updateFinancialEntryStatus: (id: string, status: FinancialStatus) => void;
  deleteFinancialEntry: (id: string) => void;
  performCashClosure: (
    countedCash: number,
    notes?: string
  ) => { closure: CashClosure; difference: number };
  // Compras
  addPurchase: (purchase: Omit<Purchase, 'id' | 'timestamp'>) => Purchase;
  updatePurchase: (purchase: Purchase) => void;
  deletePurchase: (purchaseId: string) => void;
  // Configurações & Backup
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetToDefaults: () => void;
  clearSalesAndCashData: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => { success: boolean; message: string };
}

const BusinessContext = createContext<BusinessContextType | null>(null);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<BusinessData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const businessName =
          !parsed.settings?.businessName ||
          parsed.settings.businessName === 'Sorveteria Core' ||
          parsed.settings.businessName === 'Cantino Gelado'
            ? 'Cantinho Gelado'
            : parsed.settings.businessName;
        return {
          version: parsed.version || '1.0.0',
          settings: { ...DEFAULT_INITIAL_DATA.settings, ...(parsed.settings || {}), businessName },
          products: Array.isArray(parsed.products) && parsed.products.length > 0
            ? parsed.products
            : DEFAULT_INITIAL_DATA.products,
          stockItems: Array.isArray(parsed.stockItems) && parsed.stockItems.length > 0
            ? parsed.stockItems
            : DEFAULT_INITIAL_DATA.stockItems,
          sales: Array.isArray(parsed.sales) ? parsed.sales : [],
          stockMovements: Array.isArray(parsed.stockMovements) ? parsed.stockMovements : [],
          financialEntries: Array.isArray(parsed.financialEntries) ? parsed.financialEntries : [],
          cashClosures: Array.isArray(parsed.cashClosures) ? parsed.cashClosures : [],
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
        };
      }
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
    }
    return DEFAULT_INITIAL_DATA;
  });

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('hoje');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Falha ao persistir dados no localStorage:', err);
    }
  }, [data]);

  const summary = calculateDeterministicFinancials(
    data.sales,
    data.financialEntries,
    timeFilter,
    selectedDate
  );

  const addProduct = (productInput: Omit<Product, 'id'>): Product => {
    const newId = `prod-${Date.now()}`;
    let linkedStockId = productInput.linkedStockItemId;

    let updatedStockItems = [...data.stockItems];
    if (!linkedStockId) {
      const newStockId = `stock-auto-${Date.now()}`;
      const newStockItem: StockItem = {
        id: newStockId,
        name: productInput.name,
        category: productInput.category,
        unit: productInput.category === 'Sorvetes de Massa' ? 'balde' : 'unidade',
        minStock: 2,
        currentQuantity: 5,
        isCounted: true,
        unitCost: productInput.directUnitCost,
        costStatus: productInput.costStatus,
        linkedProductId: newId
      };
      updatedStockItems.push(newStockItem);
      linkedStockId = newStockId;
    }

    const newProduct: Product = {
      ...productInput,
      id: newId,
      linkedStockItemId: linkedStockId
    };

    setData(prev => ({
      ...prev,
      products: [newProduct, ...prev.products],
      stockItems: updatedStockItems
    }));

    return newProduct;
  };

  const updateProduct = (updatedProduct: Product) => {
    setData(prev => {
      const newStockItems = prev.stockItems.map(st => {
        if (st.id === updatedProduct.linkedStockItemId || st.linkedProductId === updatedProduct.id) {
          return {
            ...st,
            name: updatedProduct.name,
            unitCost: updatedProduct.directUnitCost ?? st.unitCost,
            costStatus: updatedProduct.costStatus
          };
        }
        return st;
      });

      return {
        ...prev,
        products: prev.products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)),
        stockItems: newStockItems
      };
    });
  };

  const deleteProduct = (id: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const addStockItem = (itemInput: Omit<StockItem, 'id'>): StockItem => {
    const newItem: StockItem = {
      ...itemInput,
      id: `stock-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      stockItems: [newItem, ...prev.stockItems]
    }));
    return newItem;
  };

  const updateStockItem = (updatedItem: StockItem) => {
    setData(prev => {
      const newProducts = prev.products.map(p => {
        if (p.linkedStockItemId === updatedItem.id) {
          return {
            ...p,
            directUnitCost: updatedItem.unitCost ?? p.directUnitCost,
            costStatus: updatedItem.costStatus
          };
        }
        return p;
      });

      return {
        ...prev,
        stockItems: prev.stockItems.map(s => (s.id === updatedItem.id ? updatedItem : s)),
        products: newProducts
      };
    });
  };

  const deleteStockItem = (id: string) => {
    setData(prev => ({
      ...prev,
      stockItems: prev.stockItems.filter(s => s.id !== id),
      products: prev.products.map(p =>
        p.linkedStockItemId === id ? { ...p, linkedStockItemId: undefined } : p
      )
    }));
  };

  const adjustStockQuantity = (
    stockItemId: string,
    quantityChange: number,
    type: StockMovementType,
    reason: string,
    referenceId?: string
  ) => {
    setData(prev => {
      const item = prev.stockItems.find(s => s.id === stockItemId);
      if (!item) return prev;

      const current = item.currentQuantity ?? 0;
      const nextQuantity = Math.max(0, current + quantityChange);

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        stockItemId: item.id,
        stockItemName: item.name,
        type,
        quantityChange,
        previousQuantity: item.currentQuantity,
        newQuantity: nextQuantity,
        reason,
        referenceId
      };

      const updatedStockItems = prev.stockItems.map(s =>
        s.id === stockItemId
          ? { ...s, currentQuantity: nextQuantity, isCounted: true }
          : s
      );

      return {
        ...prev,
        stockItems: updatedStockItems,
        stockMovements: [movement, ...prev.stockMovements]
      };
    });
  };

  const performPhysicalInventory = (
    counts: { stockItemId: string; countedQuantity: number }[],
    notes?: string
  ) => {
    const timestamp = new Date().toISOString();
    setData(prev => {
      const newMovements: StockMovement[] = [];
      const updatedStockItems = prev.stockItems.map(s => {
        const found = counts.find(c => c.stockItemId === s.id);
        if (found !== undefined) {
          const prevQty = s.currentQuantity ?? 0;
          const diff = found.countedQuantity - prevQty;
          if (diff !== 0) {
            newMovements.push({
              id: `mov-inv-${Date.now()}-${s.id}`,
              timestamp,
              stockItemId: s.id,
              stockItemName: s.name,
              type: 'ajuste_inventario',
              quantityChange: diff,
              previousQuantity: s.currentQuantity,
              newQuantity: found.countedQuantity,
              reason: notes ? `Contagem Física: ${notes}` : 'Contagem Física de Inventário'
            });
          }
          return {
            ...s,
            currentQuantity: found.countedQuantity,
            isCounted: true
          };
        }
        return s;
      });

      return {
        ...prev,
        stockItems: updatedStockItems,
        stockMovements: [...newMovements, ...prev.stockMovements]
      };
    });
  };

  const createSale = (
    itemsInput: { product: Product; quantity: number }[],
    paymentMethod: PaymentMethod,
    channel: SaleChannel = 'Balcão',
    notes?: string,
    amountPaid?: number,
    discount: number = 0,
    saleDateTime?: string
  ) => {
    if (!itemsInput || itemsInput.length === 0) {
      return { success: false, error: 'O carrinho está vazio' };
    }

    const saleId = `sale-${Date.now()}`;
    const timestamp = saleDateTime ? new Date(saleDateTime).toISOString() : new Date().toISOString();
    const date = timestamp.split('T')[0];

    const saleItems = itemsInput.map(({ product, quantity }) => {
      const unitPrice = product.salePrice;
      const unitCost = product.directUnitCost;
      const totalPrice = unitPrice * quantity;
      const totalCost = unitCost !== null ? unitCost * quantity : null;

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity,
        unitPrice,
        unitCost,
        totalPrice,
        totalCost,
        linkedStockItemId: product.linkedStockItemId,
        linkedPackagingStockItemId: product.linkedPackagingStockItemId
      };
    });

    const subtotal = saleItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const total = Math.max(0, subtotal - discount);
    const paid = amountPaid !== undefined ? amountPaid : total;
    const changeAmount = paymentMethod === 'dinheiro' && paid > total ? paid - total : 0;

    const newSale: Sale = {
      id: saleId,
      timestamp,
      date,
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      channel,
      notes,
      amountPaid: paid,
      changeAmount,
      status: 'completed'
    };

    const movementsToAdd: StockMovement[] = [];
    const stockQtyDeductions: Record<string, number> = {};

    saleItems.forEach(item => {
      if (item.linkedStockItemId) {
        stockQtyDeductions[item.linkedStockItemId] =
          (stockQtyDeductions[item.linkedStockItemId] || 0) + item.quantity;
      }
      if (item.linkedPackagingStockItemId) {
        stockQtyDeductions[item.linkedPackagingStockItemId] =
          (stockQtyDeductions[item.linkedPackagingStockItemId] || 0) + item.quantity;
      }
    });

    const financialEntry: FinancialEntry = {
      id: `fin-${saleId}`,
      date,
      timestamp,
      type: 'receita',
      category: 'Venda de Balcão',
      description: `Venda #${saleId.slice(-6)} (${channel} - ${paymentMethod.toUpperCase()})`,
      amount: total,
      status: 'pago',
      paymentMethod,
      referenceId: saleId
    };

    setData(prev => {
      const updatedStock = prev.stockItems.map(st => {
        const deduction = stockQtyDeductions[st.id];
        if (deduction) {
          const prevQty = st.currentQuantity ?? 0;
          const newQty = Math.max(0, prevQty - deduction);

          movementsToAdd.push({
            id: `mov-${saleId}-${st.id}`,
            timestamp,
            stockItemId: st.id,
            stockItemName: st.name,
            type: 'saida_venda',
            quantityChange: -deduction,
            previousQuantity: st.currentQuantity,
            newQuantity: newQty,
            reason: `Baixa na Venda #${saleId.slice(-6)}`,
            referenceId: saleId
          });

          return { ...st, currentQuantity: newQty, isCounted: true };
        }
        return st;
      });

      return {
        ...prev,
        sales: [newSale, ...prev.sales],
        stockItems: updatedStock,
        stockMovements: [...movementsToAdd, ...prev.stockMovements],
        financialEntries: [financialEntry, ...prev.financialEntries]
      };
    });

    return { success: true, sale: newSale };
  };

  const cancelSale = (saleId: string, reason: string) => {
    const sale = data.sales.find(s => s.id === saleId);
    if (!sale) return { success: false, error: 'Venda não encontrada' };
    if (sale.status === 'cancelled') return { success: false, error: 'Venda já está cancelada' };

    const timestamp = new Date().toISOString();
    const reverseMovements: StockMovement[] = [];
    const stockQtyRestorations: Record<string, number> = {};

    sale.items.forEach(item => {
      if (item.linkedStockItemId) {
        stockQtyRestorations[item.linkedStockItemId] =
          (stockQtyRestorations[item.linkedStockItemId] || 0) + item.quantity;
      }
      if (item.linkedPackagingStockItemId) {
        stockQtyRestorations[item.linkedPackagingStockItemId] =
          (stockQtyRestorations[item.linkedPackagingStockItemId] || 0) + item.quantity;
      }
    });

    setData(prev => {
      const updatedStock = prev.stockItems.map(st => {
        const restore = stockQtyRestorations[st.id];
        if (restore) {
          const prevQty = st.currentQuantity ?? 0;
          const newQty = prevQty + restore;

          reverseMovements.push({
            id: `mov-estorno-${saleId}-${st.id}`,
            timestamp,
            stockItemId: st.id,
            stockItemName: st.name,
            type: 'estorno_venda',
            quantityChange: restore,
            previousQuantity: st.currentQuantity,
            newQuantity: newQty,
            reason: `Devolução por estorno da Venda #${saleId.slice(-6)}: ${reason}`,
            referenceId: saleId
          });

          return { ...st, currentQuantity: newQty };
        }
        return st;
      });

      const updatedSales = prev.sales.map(s =>
        s.id === saleId
          ? { ...s, status: 'cancelled' as const, cancelledAt: timestamp, cancelReason: reason }
          : s
      );

      const updatedFinance = prev.financialEntries.filter(f => f.referenceId !== saleId);

      return {
        ...prev,
        sales: updatedSales,
        stockItems: updatedStock,
        stockMovements: [...reverseMovements, ...prev.stockMovements],
        financialEntries: updatedFinance
      };
    });

    return { success: true };
  };

  const addFinancialEntry = (entryInput: Omit<FinancialEntry, 'id' | 'timestamp'>): FinancialEntry => {
    const newEntry: FinancialEntry = {
      ...entryInput,
      id: `fin-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      financialEntries: [newEntry, ...prev.financialEntries]
    }));

    return newEntry;
  };

  const updateFinancialEntry = (entry: FinancialEntry) => {
    setData(prev => ({
      ...prev,
      financialEntries: prev.financialEntries.map(e => (e.id === entry.id ? entry : e))
    }));
  };

  const updateFinancialEntryStatus = (id: string, status: FinancialStatus) => {
    setData(prev => ({
      ...prev,
      financialEntries: prev.financialEntries.map(e =>
        e.id === id ? { ...e, status } : e
      )
    }));
  };

  const deleteFinancialEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      financialEntries: prev.financialEntries.filter(e => e.id !== id)
    }));
  };

  const performCashClosure = (countedCash: number, notes?: string) => {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    const theoreticalCash = summary.currentDrawerCash;
    const difference = countedCash - theoreticalCash;

    let adjustmentEntry: FinancialEntry | undefined;

    if (Math.abs(difference) > 0.01) {
      const isSobra = difference > 0;
      adjustmentEntry = {
        id: `adj-closure-${Date.now()}`,
        date,
        timestamp,
        type: 'ajuste_caixa',
        category: 'Ajuste de Gaveta',
        description: isSobra
          ? `Ajuste - Sobra de Caixa (${notes || 'Conferência de gaveta'})`
          : `Ajuste - Quebra/Falta de Caixa (${notes || 'Conferência de gaveta'})`,
        amount: difference,
        status: 'pago',
        paymentMethod: 'dinheiro'
      };
    }

    const closure: CashClosure = {
      id: `closure-${Date.now()}`,
      closedAt: timestamp,
      date,
      initialCash: data.settings.defaultCashDrawerOpening,
      cashSales: data.sales
        .filter(s => s.status === 'completed' && s.paymentMethod === 'dinheiro')
        .reduce((acc, s) => acc + s.total, 0),
      otherCashInflow: 0,
      cashOutflow: 0,
      theoreticalCash,
      countedCash,
      difference,
      adjustmentEntryId: adjustmentEntry?.id,
      notes
    };

    setData(prev => ({
      ...prev,
      cashClosures: [closure, ...prev.cashClosures],
      financialEntries: adjustmentEntry
        ? [adjustmentEntry, ...prev.financialEntries]
        : prev.financialEntries
    }));

    return { closure, difference };
  };

  const addPurchase = (purchaseInput: Omit<Purchase, 'id' | 'timestamp'>): Purchase => {
    const purchaseId = `pur-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newPurchase: Purchase = {
      ...purchaseInput,
      id: purchaseId,
      timestamp
    };

    const movementsToAdd: StockMovement[] = [];
    const stockUpdates: Record<string, { qty: number; unitCost: number }> = {};

    purchaseInput.items.forEach(item => {
      stockUpdates[item.stockItemId] = {
        qty: item.quantity,
        unitCost: item.unitCost
      };
    });

    const finEntry: FinancialEntry = {
      id: `fin-pur-${purchaseId}`,
      date: purchaseInput.date,
      timestamp,
      type: 'despesa',
      category: 'Matéria-prima & Insumos',
      description: `Compra Fornecedor: ${purchaseInput.supplier} (NF: ${purchaseInput.invoiceNumber || 'S/N'})`,
      amount: purchaseInput.totalAmount,
      status: purchaseInput.paymentStatus,
      paymentMethod: purchaseInput.paymentMethod,
      referenceId: purchaseId
    };

    setData(prev => {
      const updatedStock = prev.stockItems.map(st => {
        const update = stockUpdates[st.id];
        if (update) {
          const prevQty = st.currentQuantity ?? 0;
          const newQty = prevQty + update.qty;

          movementsToAdd.push({
            id: `mov-pur-${purchaseId}-${st.id}`,
            timestamp,
            stockItemId: st.id,
            stockItemName: st.name,
            type: 'entrada_compra',
            quantityChange: update.qty,
            previousQuantity: st.currentQuantity,
            newQuantity: newQty,
            reason: `Entrada por compra - ${purchaseInput.supplier}`,
            referenceId: purchaseId
          });

          return {
            ...st,
            currentQuantity: newQty,
            unitCost: update.unitCost,
            costStatus: 'confirmed' as const,
            isCounted: true
          };
        }
        return st;
      });

      return {
        ...prev,
        purchases: [newPurchase, ...prev.purchases],
        stockItems: updatedStock,
        stockMovements: [...movementsToAdd, ...prev.stockMovements],
        financialEntries: [finEntry, ...prev.financialEntries]
      };
    });

    return newPurchase;
  };

  const updatePurchase = (updatedPurchase: Purchase) => {
    setData(prev => {
      // Atualiza também a entrada financeira vinculada
      const updatedFinance = prev.financialEntries.map(f => {
        if (f.referenceId === updatedPurchase.id || f.id === `fin-pur-${updatedPurchase.id}`) {
          return {
            ...f,
            date: updatedPurchase.date,
            description: `Compra Fornecedor: ${updatedPurchase.supplier} (NF: ${updatedPurchase.invoiceNumber || 'S/N'})`,
            amount: updatedPurchase.totalAmount,
            status: updatedPurchase.paymentStatus,
            paymentMethod: updatedPurchase.paymentMethod
          };
        }
        return f;
      });

      return {
        ...prev,
        purchases: prev.purchases.map(p => (p.id === updatedPurchase.id ? updatedPurchase : p)),
        financialEntries: updatedFinance
      };
    });
  };

  const deletePurchase = (purchaseId: string) => {
    const purchase = data.purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const timestamp = new Date().toISOString();
    const rollbackMovements: StockMovement[] = [];
    const stockDeductions: Record<string, number> = {};

    purchase.items.forEach(item => {
      stockDeductions[item.stockItemId] = (stockDeductions[item.stockItemId] || 0) + item.quantity;
    });

    setData(prev => {
      const updatedStock = prev.stockItems.map(st => {
        const deduction = stockDeductions[st.id];
        if (deduction) {
          const prevQty = st.currentQuantity ?? 0;
          const newQty = Math.max(0, prevQty - deduction);

          rollbackMovements.push({
            id: `mov-rollback-pur-${purchaseId}-${st.id}`,
            timestamp,
            stockItemId: st.id,
            stockItemName: st.name,
            type: 'ajuste_inventario',
            quantityChange: -deduction,
            previousQuantity: st.currentQuantity,
            newQuantity: newQty,
            reason: `Estorno automático por exclusão/revogação de compra: ${purchase.supplier}`,
            referenceId: purchaseId
          });

          return { ...st, currentQuantity: newQty };
        }
        return st;
      });

      // Remove a compra
      const updatedPurchases = prev.purchases.filter(p => p.id !== purchaseId);

      // Cancela/remove a despesa financeira gerada pela compra
      const updatedFinance = prev.financialEntries.filter(
        f => f.referenceId !== purchaseId && f.id !== `fin-pur-${purchaseId}`
      );

      return {
        ...prev,
        purchases: updatedPurchases,
        stockItems: updatedStock,
        stockMovements: [...rollbackMovements, ...prev.stockMovements],
        financialEntries: updatedFinance
      };
    });
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const resetToDefaults = () => {
    setData(DEFAULT_INITIAL_DATA);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_DATA));
    } catch (e) {
      console.error(e);
    }
  };

  const clearSalesAndCashData = () => {
    setData(prev => {
      const cleaned: BusinessData = {
        ...prev,
        sales: [],
        financialEntries: [],
        cashClosures: [],
        purchases: [],
        stockMovements: []
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } catch (e) {
        console.error(e);
      }
      return cleaned;
    });
  };

  const exportBackupJson = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const importBackupJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Arquivo JSON inválido ou mal formatado.' };
      }
      if (!Array.isArray(parsed.products) || !Array.isArray(parsed.stockItems)) {
        return { success: false, message: 'O arquivo não contém produtos ou itens de estoque válidos.' };
      }

      const importedData: BusinessData = {
        version: parsed.version || '1.0.0',
        settings: { ...DEFAULT_INITIAL_DATA.settings, ...(parsed.settings || {}) },
        products: parsed.products,
        stockItems: parsed.stockItems,
        sales: Array.isArray(parsed.sales) ? parsed.sales : [],
        stockMovements: Array.isArray(parsed.stockMovements) ? parsed.stockMovements : [],
        financialEntries: Array.isArray(parsed.financialEntries) ? parsed.financialEntries : [],
        cashClosures: Array.isArray(parsed.cashClosures) ? parsed.cashClosures : [],
        purchases: Array.isArray(parsed.purchases) ? parsed.purchases : []
      };

      setData(importedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
      return { success: true, message: 'Backup importado com sucesso!' };
    } catch (err) {
      return { success: false, message: `Erro ao importar: ${(err as Error).message}` };
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        data,
        summary,
        timeFilter,
        selectedDate,
        setTimeFilter,
        setSelectedDate,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        adjustStockQuantity,
        performPhysicalInventory,
        createSale,
        cancelSale,
        addFinancialEntry,
        updateFinancialEntry,
        updateFinancialEntryStatus,
        deleteFinancialEntry,
        performCashClosure,
        addPurchase,
        updatePurchase,
        deletePurchase,
        updateSettings,
        resetToDefaults,
        clearSalesAndCashData,
        exportBackupJson,
        importBackupJson
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness deve ser utilizado dentro de um BusinessProvider');
  }
  return context;
};
