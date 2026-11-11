# Publicação no GitHub Pages & Suporte PWA (Cantinho Gelado)

Plano detalhado para configurar a publicação automática do aplicativo **Cantinho Gelado** no GitHub Pages, garantindo que o sistema rodará via link público no celular e notebook com funcionamento PWA (instalável na tela inicial) e suporte Local-First com backup/exportação JSON.

## Decisões Confirmadas do Usuário

> [!IMPORTANT]
> - **Plataforma de Hospedagem**: Publicação via **GitHub Pages** a partir do repositório do GitHub com rota base configurada (`base: '/<nome-do-repo>/'`).
> - **Modo de Operação e Dispositivos**: Operação **Local-First (PWA)** com suporte offline no celular/notebook. Para múltiplos dispositivos sem servidor dedicado, o sistema disponibiliza **Exportação e Importação de Backup JSON** e sincronização instantânea.
> - **Instalação no Celular**: Configuração de suporte PWA (`vite-plugin-pwa` ou suporte Web App Manifest + Service Worker) com ícone de atalho na tela inicial no Android e iPhone.

---

## 1. Visão Geral do Produto & Fluxo

- **Objetivo**: Permitir que o proprietário acesse o **Cantinho Gelado** a partir de um link público do GitHub Pages (ex: `https://usuario.github.io/cantinho-gelado/`), podendo instalar como um aplicativo no smartphone (iOS e Android) e rodar em qualquer navegador no notebook sem depender de servidores pagos.
- **Público-Alvo**: Gestor da sorveteria operando balcão, caixa e estoque pelo celular ou computador.
- **Exportação e Backup**: Mecanismo de 1 clique para baixar arquivo de dados `.json` e restaurar no outro dispositivo para manter celular e notebook sempre sincronizados.

---

## 2. Experiência do Usuário & Publicação

### Fluxo de Instalação e Uso
1. **Acesso pelo Link**: O usuário abre o link do GitHub Pages no celular ou notebook.
2. **Instalação PWA**: Botão "Instalar App" ou "Adicionar à Tela Inicial" no Safari/Chrome, tornando o sistema um app nativo sem barra de navegador.
3. **Uso Contínuo Offline**: O aplicativo abre instantaneamente mesmo sem conexão à internet.
4. **Sincronização entre Dispositivos**: Botão em *Configurações e Backup* para exportar/importar dados via JSON com 1 toque entre notebook e celular.

### Identidade Visual & Manifest
- **Nome do App**: Cantinho Gelado (Business Core)
- **Nome Curto (Home Screen)**: CantinhoGelado
- **Cores do Tema**: Laranja Terracota (`#C2410C`), Amarelo Âmbar (`#D97706`) e Fundo Creme (`#F9F8F6`).

---

## 3. Decisões do Produto e Ajustes Técnicos

1. **Configuração de Rota Base no Vite (`vite.config.ts`)**:
   - Adicionar propriedade `base` condicional ou padrão para suportar caminhos do GitHub Pages (ex: `./` ou `process.env.GITHUB_REPOSITORY`).
2. **Script de Deploy no `package.json`**:
   - Incluir script `"deploy": "gh-pages -d dist"` para publicar o build com 1 comando (`npm run deploy`).
3. **Manifesto PWA & Meta Tags (`index.html` e `manifest.json`)**:
   - Configurar manifesto Web App (`display: standalone`, ícones 192x192, 512x512, cores de tema).
4. **Guia Passo a Passo no Painel de Configurações**:
   - Adicionar modal/seção de ajuda explicativa em *Configurações e Backup* ensinando como subir para o GitHub e rodar no celular.

---

## 4. Arquitetura do Sistema e Fluxo de Publicação

```
┌─────────────────────────────────────────────────────────────┐
│                   Repositório no GitHub                     │
│               (Código Fonte: React + Vite + TS)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ `npm run build && gh-pages`
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Pages (Link Público)                 │
│         `https://<usuario>.github.io/<repositorio>/`       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    Celular (App PWA)         │ │   Notebook (Navegador)      │
│  - Armazenamento Local       │ │  - Armazenamento Local      │
│  - Importar/Exportar JSON    │ │  - Importar/Exportar JSON   │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## Próximos Passos de Execução
1. Configurar `vite.config.ts` com `base: './'` para compatibilidade total com GitHub Pages.
2. Adicionar o pacote `gh-pages` e scripts de deploy no `package.json`.
3. Adicionar arquivo `public/manifest.json` com ícones PWA e meta tags no `index.html`.
4. Incluir guia prático dentro de *Configurações e Backup* com o passo a passo exato para subir no GitHub.
