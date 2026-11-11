import { FinancialEntry, Sale, TimeFilter } from '../types';

export interface DeterministicFinancialSummary {
  grossSales: number;
  cancelledSales: number;
  netSales: number;
  salesCount: number;
  cmv: number;
  hasIncompleteCosts: boolean;
  incompleteCostItemsCount: number;
  grossProfit: number;
  grossMarginPercent: number | null;
  paidOperatingExpenses: number;
  pendingOperatingExpenses: number;
  totalOperatingExpenses: number;
  netProfit: number;
  netProfitMarginPercent: number | null;
  totalCashBalance: number;
  totalPaidInflows: number;
  totalPaidOutflows: number;
  currentDrawerCash: number;
  periodInflows: number;
  periodOutflows: number;
  periodNetResult: number;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function getFilterDates(filter: TimeFilter, customDateStr?: string) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  return { todayStr, yesterdayStr, currentMonthStr };
}

export function calculateDeterministicFinancials(
  sales: Sale[],
  financialEntries: FinancialEntry[],
  timeFilter: TimeFilter = 'hoje',
  selectedDate?: string
): DeterministicFinancialSummary {
  const { todayStr, yesterdayStr, currentMonthStr } = getFilterDates(timeFilter);
  const targetDate = selectedDate || todayStr;

  const matchesTime = (dateStr: string) => {
    if (timeFilter === 'tudo') return true;
    if (timeFilter === 'hoje') return dateStr === todayStr;
    if (timeFilter === 'ontem') return dateStr === yesterdayStr;
    if (timeFilter === 'mes') return dateStr.startsWith(currentMonthStr);
    if (timeFilter === 'data') return dateStr === targetDate;
    return true;
  };

  // 1. Vendas no período
  let grossSales = 0;
  let cancelledSales = 0;
  let netSales = 0;
  let salesCount = 0;
  let cmv = 0;
  let incompleteCostItemsCount = 0;

  for (const sale of sales) {
    if (!matchesTime(sale.date)) continue;

    if (sale.status === 'cancelled') {
      cancelledSales += sale.total;
      continue;
    }

    salesCount += 1;
    grossSales += sale.total;
    netSales += sale.total;

    for (const item of sale.items) {
      if (item.unitCost !== null && item.unitCost !== undefined && item.unitCost >= 0) {
        cmv += item.unitCost * item.quantity;
      } else {
        incompleteCostItemsCount += item.quantity;
      }
    }
  }

  const hasIncompleteCosts = incompleteCostItemsCount > 0;
  const grossProfit = netSales - cmv;
  const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : null;

  // 2. Despesas e Fluxo de Caixa no Período vs Acumulado Geral
  let totalPaidInflows = 0;
  let totalPaidOutflows = 0;
  let currentDrawerCash = 0;

  let periodInflows = 0;
  let periodOutflows = 0;
  let paidOperatingExpenses = 0;
  let pendingOperatingExpenses = 0;

  for (const entry of financialEntries) {
    const isPeriodMatch = matchesTime(entry.date);

    // Acumulado geral da gaveta e contas
    if (entry.status === 'pago') {
      if (entry.type === 'receita') {
        totalPaidInflows += entry.amount;
        if (entry.paymentMethod === 'dinheiro') {
          currentDrawerCash += entry.amount;
        }
      } else if (entry.type === 'despesa') {
        totalPaidOutflows += entry.amount;
        if (entry.paymentMethod === 'dinheiro') {
          currentDrawerCash -= entry.amount;
        }
      } else if (entry.type === 'ajuste_caixa') {
        if (entry.amount >= 0) {
          totalPaidInflows += entry.amount;
          currentDrawerCash += entry.amount;
        } else {
          totalPaidOutflows += Math.abs(entry.amount);
          currentDrawerCash -= Math.abs(entry.amount);
        }
      }
    }

    // Período filtrado
    if (isPeriodMatch) {
      if (entry.status === 'pago') {
        if (entry.type === 'receita') {
          periodInflows += entry.amount;
        } else if (entry.type === 'despesa') {
          periodOutflows += entry.amount;
          paidOperatingExpenses += entry.amount;
        } else if (entry.type === 'ajuste_caixa') {
          if (entry.amount >= 0) {
            periodInflows += entry.amount;
          } else {
            periodOutflows += Math.abs(entry.amount);
          }
        }
      } else {
        if (entry.type === 'despesa') {
          pendingOperatingExpenses += entry.amount;
        }
      }
    }
  }

  const totalCashBalance = totalPaidInflows - totalPaidOutflows;
  const periodNetResult = periodInflows - periodOutflows;
  const totalOperatingExpenses = paidOperatingExpenses + pendingOperatingExpenses;
  const netProfit = grossProfit - paidOperatingExpenses;
  const netProfitMarginPercent = netSales > 0 ? (netProfit / netSales) * 100 : null;

  return {
    grossSales,
    cancelledSales,
    netSales,
    salesCount,
    cmv,
    hasIncompleteCosts,
    incompleteCostItemsCount,
    grossProfit,
    grossMarginPercent,
    paidOperatingExpenses,
    pendingOperatingExpenses,
    totalOperatingExpenses,
    netProfit,
    netProfitMarginPercent,
    totalCashBalance,
    totalPaidInflows,
    totalPaidOutflows,
    currentDrawerCash,
    periodInflows,
    periodOutflows,
    periodNetResult,
  };
}

export function getStockItemIndividualUnitCost(stockItem: { unitCost: number | null; itemsPerPackage?: number }): number | null {
  if (stockItem.unitCost === null || stockItem.unitCost === undefined) return null;
  const itemsPerPkg = stockItem.itemsPerPackage && stockItem.itemsPerPackage > 0 ? stockItem.itemsPerPackage : 1;
  return stockItem.unitCost / itemsPerPkg;
}

export function formatStockQuantityWithPackage(
  currentQuantity: number | null,
  unit: string,
  itemsPerPackage?: number,
  packageUnitName?: string
): { mainText: string; subText?: string } {
  if (currentQuantity === null || currentQuantity === undefined) {
    return { mainText: 'Sem contagem' };
  }

  if (itemsPerPackage && itemsPerPackage > 1) {
    const totalIndividualUnits = Math.round(currentQuantity * itemsPerPackage);
    const fullPackages = Math.floor(currentQuantity);
    const remainderUnits = Math.round((currentQuantity - fullPackages) * itemsPerPackage);

    const subName = packageUnitName || 'unidades';

    if (fullPackages > 0 && remainderUnits > 0) {
      return {
        mainText: `${fullPackages} ${unit}s e ${remainderUnits} ${subName}`,
        subText: `Total: ${totalIndividualUnits} ${subName}`
      };
    } else if (fullPackages > 0) {
      return {
        mainText: `${fullPackages} ${unit}${fullPackages > 1 ? 's' : ''}`,
        subText: `${totalIndividualUnits} ${subName} no total`
      };
    } else {
      return {
        mainText: `${remainderUnits} ${subName}`,
        subText: `(${currentQuantity.toFixed(2)} ${unit})`
      };
    }
  }

  return {
    mainText: `${currentQuantity} ${unit}`
  };
}

export function calculateProductEffectiveUnitCost(
  product: { recipeItems?: { stockItemId: string; quantity: number; unitCost: number }[]; directUnitCost: number | null },
  stockItems: { id: string; unitCost: number | null; itemsPerPackage?: number }[]
): number | null {
  if (product.recipeItems && product.recipeItems.length > 0) {
    let totalCost = 0;
    let hasValidCost = false;

    for (const item of product.recipeItems) {
      const stock = stockItems.find(s => s.id === item.stockItemId);
      const pkgSize = stock?.itemsPerPackage && stock.itemsPerPackage > 0 ? stock.itemsPerPackage : 1;
      const baseCost = stock?.unitCost ?? item.unitCost;

      if (baseCost !== null && baseCost !== undefined && baseCost >= 0) {
        const individualCost = baseCost / pkgSize;
        totalCost += item.quantity * individualCost;
        hasValidCost = true;
      }
    }

    if (hasValidCost) {
      return totalCost;
    }
  }

  return product.directUnitCost;
}

