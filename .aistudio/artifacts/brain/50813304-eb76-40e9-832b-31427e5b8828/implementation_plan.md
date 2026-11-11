# Redesign Mobile-First & Layout Nativo para Smartphones (Cantinho Gelado)

Plano de otimização da experiência mobile para transformar o **Cantinho Gelado** em um aplicativo web com sensação 100% nativa em smartphones (iOS e Android), eliminando rolagens horizontais indesejadas, amontoados de botões e sobreposições de telas.

## Decisões Confirmadas do Usuário

> [!IMPORTANT]
> - **Tabelas em Cards Verticais**: No celular (`md:hidden`), todas as tabelas de **Estoque**, **Compras**, **Financeiro**, **Vendas** e **Relatórios** serão exibidas como cards verticais empilhados com alvos de toque amplos ($\ge 44\text{px}$). No desktop (`hidden md:table`), a visualização em tabela permanece intacta.
> - **Cabeçalho Otimizado no Celular**: O `TopBar` no celular será limpo e compacto (apenas marca e botão de menu), ocultando os botões secundários amontoados e mantendo as ações organizadas na barra inferior (`BottomNav`) e no menu gaveta (`MobileDrawer`).
> - **Ergonomia e Densidade Nativa**: Fontes, espaçamentos e botões calibrados especificamente para telas de 360px a 430px, com 0% de transbordo lateral (`overflow-x-hidden`).

---

## 1. Visão Geral do Produto & UX Mobile

- **Objetivo**: Garantir que o proprietário opere o **Cantinho Gelado** no celular com a mesma agilidade e fluidez de um aplicativo nativo instalado da App Store ou Google Play.
- **Princípio Ergonomico**: Ações principais ao alcance do polegar na zona inferior da tela (botão flutuante `+ Vender`, abas de navegação e gaveta).
- **Sem Transbordo Lateral**: Eliminar qualquer elemento que force a tela a deslizar para os lados involuntariamente.

---

## 2. Especificações de Design & Layouts Mobile

### A. Cabeçalho Otimizado (`TopBar.tsx`)
- **Desktop (`md:flex`)**: Mantém a barra completa com breadcrumbs, filtro de período e 5 botões de ação rápida.
- **Mobile (`md:hidden`)**: Exibe uma barra compacta de 52px de altura com:
  - Esquerda: Ícone de sorvete 🍦 + Nome **Cantinho Gelado** + Seção Atual.
  - Direita: Botão de menu hambúrguer ☰ com área de toque de $44 \times 44\text{px}$.

### B. Cards Verticais Empilhados (Substituição de Tabelas no Mobile)
1. **Estoque (`StockPage.tsx`)**:
   - Cada insumo vira um card com nome em destaque, ícone de categoria, badge de saldo atual (verde se normal, vermelho se crítico, laranja se sem contagem), valor unitário e botões de `[Movimentar]` e `[Excluir]` em formato de botão touch amplo.
2. **Compras (`PurchasesPage.tsx`)**:
   - Card por compra com número do pedido (`#40892`), data, fornecedor, lista de itens comprados, badge de status (Pago/Pendente) e botões de `[Editar]` e `[Estornar/Excluir]`.
3. **Financeiro / Livro Caixa (`FinancialPage.tsx`)**:
   - Card por lançamento com data, descrição, categoria, valor em verde (`+R$`) ou vermelho (`-R$`), badge de status e botões de ação.
4. **Vendas (`SalesPage.tsx`)**:
   - Card por venda com horário, canal (Balcão/Mesa/Entrega), itens vendidos, forma de pagamento (PIX/Dinheiro/Cartão) e valor total.
5. **Relatórios & DRE (`ReportsPage.tsx`)**:
   - Cards resumos empilhados com tipografia mono tabular (`tabular-nums`) e margens ajustadas para telas pequenas.

### C. Navegação e Interação no Polegar (`BottomNav.tsx` & `MobileDrawer.tsx`)
- **Barra Inferior Fixa**:
  - 5 zonas com alvos de $44\text{px}$: *Início*, *Vendas*, Botão Central Flutuante `+ Vender`, *Estoque* e *Mais*.
- **Menu Gaveta (`MobileDrawer.tsx`)**:
  - Animação suave de deslizamento lateral com atalhos de toque para *Lançar Despesa*, *Nova Compra*, *Contagem* e *Fechar Caixa*.

---

## 3. Arquitetura do Componente & Layout Responsive

```
┌─────────────────────────────────────────────────────────────┐
│              TopBar Compacto (Mobile: 52px)                 │
│  [🍦 Cantinho Gelado / Estoque]                    [ ☰ Menu]│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Conteúdo Principal (Scroll)                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Card de Insumo 1 (Massa Chocolate 10L)               │  │
│  │ Saldo: 4 baldes | Mínimo: 2 baldes                    │  │
│  │ [ Movimentar ]                         [ Excluir ]    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Card de Insumo 2 (Pistache Puro 10L)                  │  │
│  │ Saldo: 1 balde (Estoque Baixo)                        │  │
│  │ [ Movimentar ]                         [ Excluir ]    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              BottomNav Fixa (Zona do Polegar)               │
│ [Início]   [Vendas]    [ ( + Vender ) ]   [Estoque]   [Mais]│
└─────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos de Execução
1. Atualizar `TopBar.tsx` para esconder botões amontoados no mobile e exibir barra compacta.
2. Atualizar `StockPage.tsx` criando a visualização em cards verticais no mobile.
3. Atualizar `PurchasesPage.tsx` adicionando cards verticais para compras no mobile.
4. Atualizar `FinancialPage.tsx` transformando o extrato financeiro em cards no mobile.
5. Atualizar `SalesPage.tsx` e `ReportsPage.tsx` com suporte a cards empilhados no mobile.
6. Verificar compilação (`compile_applet` + `lint_applet`) e reiniciar servidor.
