# Prompt Técnico para Recriação no Google AI Studio: Sistema de Gestão para Sorveteria & Gelateria (Sorveteria Core)

Use este prompt no **Google AI Studio Build** para gerar uma aplicação completa de gestão financeira, de estoque e de vendas para uma **Sorveteria & Gelateria**.

---

## 1. Visão Geral do Sistema
Crie uma aplicação web em **React + Tailwind CSS + TypeScript** com o nome **Gelato & Açaí Manager (Sorveteria Core)**.
O sistema deve operar em modo **100% offline-first com armazenamento local no `localStorage`** (`sorveteria_business_data_v1`), com interface profissional em estilo **Liquid Glass / Modern Clean**, totalmente responsiva em desktops e dispositivos móveis (smartphones/tablets).

---

## 2. Princípios Fundamentais & Arquitetura
1. **Sem Números Inventados (Matemática Determinística)**:
   - Todo calculo de Vendas Líquidas, Margem Bruta, CMV, Lucro Líquido e Saldo em Caixa deve ser realizado por fórmulas puras sem estimativas fantasma.
   - Produtos ou insumos sem custo/preço cadastrado devem ser sinalizados expressamente como "(incompleto)" ou "Não informado".
2. **Sincronização Automática Cardápio ↔ Estoque**:
   - Todo produto cadastrado no Cardápio (Sorvetes de Massa, Picolés, Copos de Açaí, Coberturas) gera ou vincula automaticamente um item correspondente no Estoque.
   - Alterações no nome ou custo direto de um produto no Cardápio refletem imediatamente no estoque correspondente.
3. **Controle de Caixa Auditável com Fechamento Diário**:
   - Saldo de Caixa Total Atual = Saldo Inicial + Entradas Pagas - Saídas Pagas.
   - O Fechamento Diário de Caixa permite conferência física da gaveta. Qualquer sobra ou falta de caixa gera automaticamente um lançamento financeiro de ajuste (`Ajuste - Sobra de Caixa` ou `Ajuste - Quebra/Falta de Caixa`).
4. **Respeito aos Dados Existentes**:
   - O carregamento de dados do `localStorage` deve ser aditivo e não-destrutivo. Atualizações de código não devem apagar vendas ou históricos existentes do usuário.

---

## 3. Categorias do Negócio (Sorveteria)

### Categorias do Cardápio (`ProductCategory`):
- `Sorvetes de Massa` (Potes 10L, 5L, 2L, Taças, Cascões, Bolas)
- `Picolés` (Fruta, Leite, Recheados, Skimo)
- `Açaí & Copos` (Copos 300ml, 500ml, 700ml, Tigelas)
- `Outros` (Bebidas, Água, Embalagens para viagem)

### Categorias de Estoque (`StockCategory`):
- `Sorvetes de Massa`
- `Picolés`
- `Açaí & Copos`
- `Coberturas & Toppings` (Granulado, Leite em pó, Morango, Calda de chocolate, Paçoca)
- `Embalagens & Casquinhas` (Casquinhas, Cascões, Copos plásticos, Colheres, Guardanapos)
- `Outros` (Produtos de limpeza, materiais de apoio)

---

## 4. Telas Principais do Sistema

1. **Visão Geral / Dashboard (`OverviewPage`)**:
   - Card de Destaque: **Caixa Total Atual** com detalhamento de Entradas (+) e Saídas (-).
   - KPIs: Vendas Líquidas, Lucro Bruto & Margem %, Despesas Operacionais, Lucro Líquido Estimado.
   - Tabela de Produtos Mais Vendidos e Alertas de Estoque Baixo ou Sem Contagem Inicial.

2. **Registro de Vendas & Balcão (`SalesPage`)**:
   - PDV rápido de balcão com seleção por categoria (Sorvetes, Picolés, Açaí).
   - Formas de pagamento: Dinheiro, PIX, Débito, Crédito.
   - Baixa automática no estoque ao concluir a venda.
   - Opção de estorno/cancelamento de venda com auditoria e devolução de estoque.

3. **Controle de Estoque & Inventário (`StockPage`)**:
   - Lista completa de insumos, embalagens e produtos.
   - Botão **Novo Item no Estoque** para cadastrar materiais avulsos.
   - Botão **Movimentação Avulsa** (Entradas, Perdas, Ajustes).
   - Modal de **Contagem Física de Inventário**.
   - Opção de remoção de itens do estoque com confirmação prévia.

4. **Gestão Financeira & Caixa (`FinancialPage`)**:
   - Registro de Contas a Pagar / Despesas Fixas (Aluguel, Energia/Freezers, Matéria-prima).
   - Relatório de Entradas Efetivas vs Saídas Efetivas.
   - Modal de **Fechamento Diário de Caixa** com reconciliação de dinheiro na gaveta.

5. **Cardápio & Formação de Preços (`MenuAndCostsPage`)**:
   - Cadastro e edição de produtos com preço de venda e custo direto.
   - Sincronização automática com o módulo de estoque.

6. **Compras & Fornecedores (`PurchasesPage`)**:
   - Registro de compras de lotes de picolés, caldas, embalagens e insumos com entrada automática no estoque e lançamento financeiro.

7. **Configurações & Backup (`SettingsPage`)**:
   - Nome do negócio, fundo de abertura padrão de gaveta.
   - Exportação e importação de backup em formato JSON.

---

## 5. Exemplo de Dados Iniciais Genéricos (`initialData.ts`)

```typescript
export const INITIAL_PRODUCTS = [
  { id: 'prod-sorvete-bola', name: 'Bola de Sorvete (Taça/Casquinha)', category: 'Sorvetes de Massa', salePrice: 7.00, active: true, hasRecipe: false, directUnitCost: 1.80, costStatus: 'confirmed' },
  { id: 'prod-picole-fruta', name: 'Picolé de Fruta (Variados)', category: 'Picolés', salePrice: 4.00, active: true, hasRecipe: false, directUnitCost: 1.10, costStatus: 'confirmed' },
  { id: 'prod-acai-500ml', name: 'Copo de Açaí 500ml c/ 3 Toppings', category: 'Açaí & Copos', salePrice: 18.00, active: true, hasRecipe: false, directUnitCost: 5.50, costStatus: 'confirmed' },
];

export const INITIAL_STOCK_ITEMS = [
  { id: 'stock-sorvete-chocolate-10l', name: 'Balde Sorvete Chocolate 10L', category: 'Sorvetes de Massa', unit: 'caixa', minStock: 2, currentQuantity: null, isCounted: false, unitCost: 85.00 },
  { id: 'stock-casquinha-simples', name: 'Casquinha de Sorvete (Caixa c/ 300)', category: 'Embalagens & Casquinhas', unit: 'caixa', minStock: 1, currentQuantity: null, isCounted: false, unitCost: 45.00 },
  { id: 'stock-acai-caixa-10l', name: 'Caixa de Açaí Tradicional 10L', category: 'Açaí & Copos', unit: 'caixa', minStock: 2, currentQuantity: null, isCounted: false, unitCost: 110.00 },
];
```

Instrução Final: Construa toda a interface com visual moderno em tons de creme, azul sorvete e âmbar quentinho, botões arredondados touch-friendly, tabelas limpas e feedbacks instantâneos.
