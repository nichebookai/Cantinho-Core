export type ProductCategory =
  | 'Sorvetes de Massa'
  | 'Picolés'
  | 'Açaí & Copos'
  | 'Outros';

export type StockCategory =
  | 'Sorvetes de Massa'
  | 'Picolés'
  | 'Açaí & Copos'
  | 'Coberturas & Toppings'
  | 'Embalagens & Casquinhas'
  | 'Outros';

export type StockUnit =
  | 'caixa'
  | 'balde'
  | 'unidade'
  | 'kg'
  | 'litro'
  | 'ml'
  | 'porção'
  | 'pacote';

export interface RecipeItem {
  stockItemId: string;
  stockItemName: string;
  quantity: number;
  unit: StockUnit;
  unitCost: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit?: StockUnit;
  salePrice: number;
  active: boolean;
  hasRecipe: boolean;
  directUnitCost: number | null;
  costStatus: 'confirmed' | 'incomplete';
  linkedStockItemId?: string;
  linkedPackagingStockItemId?: string;
  portionSize?: number;
  portionLabel?: string;
  description?: string;
  costNote?: string;
  recipeItems?: RecipeItem[];
}

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  unit: StockUnit;
  minStock: number;
  currentQuantity: number | null; // null = sem contagem inicial
  isCounted: boolean;
  unitCost: number | null;
  costStatus: 'confirmed' | 'incomplete';
  linkedProductId?: string;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito';
export type SaleChannel = 'Balcão' | 'Mesa' | 'Entrega';

export interface SaleItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  totalPrice: number;
  totalCost: number | null;
  linkedStockItemId?: string;
  linkedPackagingStockItemId?: string;
}

export interface Sale {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  channel?: SaleChannel;
  notes?: string;
  amountPaid?: number;
  changeAmount?: number;
  status: 'completed' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
}

export type StockMovementType =
  | 'entrada_compra'
  | 'saida_venda'
  | 'perda_descarte'
  | 'ajuste_inventario'
  | 'estorno_venda'
  | 'movimentacao_avulsa';

export interface StockMovement {
  id: string;
  timestamp: string;
  stockItemId: string;
  stockItemName: string;
  type: StockMovementType;
  quantityChange: number;
  previousQuantity: number | null;
  newQuantity: number | null;
  reason: string;
  referenceId?: string;
}

export type FinancialEntryType = 'receita' | 'despesa' | 'ajuste_caixa';
export type FinancialStatus = 'pago' | 'pendente';

export interface FinancialEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  type: FinancialEntryType;
  category: string;
  description: string;
  amount: number;
  status: FinancialStatus;
  paymentMethod?: PaymentMethod;
  referenceId?: string;
}

export interface CashClosure {
  id: string;
  closedAt: string;
  date: string;
  initialCash: number;
  cashSales: number;
  otherCashInflow: number;
  cashOutflow: number;
  theoreticalCash: number;
  countedCash: number;
  difference: number;
  adjustmentEntryId?: string;
  notes?: string;
}

export interface PurchaseItem {
  stockItemId: string;
  stockItemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  timestamp: string;
  date: string;
  supplier: string;
  invoiceNumber?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: FinancialStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface BusinessSettings {
  businessName: string;
  document?: string;
  defaultCashDrawerOpening: number;
  currencySymbol: string;
  lowStockThresholdAlert: boolean;
}

export interface BusinessData {
  version: string;
  settings: BusinessSettings;
  products: Product[];
  stockItems: StockItem[];
  sales: Sale[];
  stockMovements: StockMovement[];
  financialEntries: FinancialEntry[];
  cashClosures: CashClosure[];
  purchases: Purchase[];
}

export type TimeFilter = 'hoje' | 'ontem' | 'mes' | 'tudo' | 'data';

export type ActiveTab =
  | 'overview'
  | 'sales'
  | 'financial'
  | 'stock'
  | 'menu'
  | 'purchases'
  | 'reports'
  | 'settings';
