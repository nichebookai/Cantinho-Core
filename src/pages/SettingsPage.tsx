import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Building,
  DollarSign,
  Shield,
  HardDrive
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/deterministicMath';

export const SettingsPage: React.FC = () => {
  const {
    data,
    updateSettings,
    exportBackupJson,
    importBackupJson,
    resetToDefaults,
    clearSalesAndCashData
  } = useBusiness();

  const [businessName, setBusinessName] = useState(data.settings.businessName);
  const [taxDocument, setTaxDocument] = useState(data.settings.document || '');
  const [defaultOpening, setDefaultOpening] = useState(
    data.settings.defaultCashDrawerOpening.toString()
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados de backup
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim() || 'Gelato & Açaí Manager',
      document: taxDocument.trim() || undefined,
      defaultCashDrawerOpening: parseFloat(defaultOpening) || 100.0
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `cantinho_gelado_backup_${dateStr}.json`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupJson(content);
        setImportStatus(result);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
    setBusinessName(data.settings.businessName);
    setDefaultOpening('150.00');
    setImportStatus({
      success: true,
      message: 'Sistema redefinido para o catálogo essencial inicial com sucesso!'
    });
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900 leading-tight">
          Configurações do Estabelecimento & Backup
        </h2>
        <p className="text-xs text-slate-500">
          Personalização de marca, fundo de gaveta padrão e exportação/importação de segurança
        </p>
      </div>

      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            importStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {importStatus.success ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{importStatus.message}</span>
        </div>
      )}

      {/* Dados do Estabelecimento */}
      <div className="liquid-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Building className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Identificação da Sorveteria / Gelateria
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nome Fantasia do Negócio *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                CNPJ ou Identificação
              </label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={taxDocument}
                onChange={e => setTaxDocument(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fundo Padrão de Abertura de Gaveta (R$) *
              </label>
              <input
                type="number"
                step="5.00"
                min="0"
                required
                value={defaultOpening}
                onChange={e => setDefaultOpening(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Valor em dinheiro disponibilizado no início de cada turno para troco.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {saveSuccess ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Configurações salvas com sucesso!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>

      {/* Guia Prático: Publicação no GitHub Pages & Instalação no Celular */}
      <div className="liquid-card rounded-2xl p-6 space-y-4 border border-amber-200/80 bg-amber-50/30">
        <div className="flex items-center gap-2 pb-2 border-b border-amber-200/60">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            🐙
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Como Publicar no GitHub Pages & Usar pelo Celular
            </h3>
            <p className="text-[11px] text-slate-500">
              Passo a passo simples para gerar seu link público e instalar o aplicativo no smartphone
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          {/* Passo 1 */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">1</span>
              Subir no GitHub
            </span>
            <p className="text-[11px] text-slate-600 leading-normal">
              Crie um repositório no seu GitHub (ex: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">cantinho-gelado</code>) e envie o código fonte.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
              Publicar com 1 Comando
            </span>
            <p className="text-[11px] text-slate-600 leading-normal">
              No seu computador, rode <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">npm run deploy</code>. A página será publicada em <code className="text-amber-800 font-semibold font-mono">https://usuario.github.io/repo/</code>.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
              Instalar no Celular
            </span>
            <p className="text-[11px] text-slate-600 leading-normal">
              Abra o link no celular e selecione <strong>Adicionar à Tela Inicial</strong> (no Safari/Chrome) para usar como app nativo offline-first!
            </p>
          </div>
        </div>
      </div>

      {/* Backup e Restauração */}
      <div className="liquid-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Backup Local & Segurança dos Dados
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          O sistema opera em modo <strong>100% offline-first</strong> utilizando o armazenamento do seu navegador (<code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">localStorage</code>). Exporte cópias de segurança em arquivo JSON periodicamente para garantir que seus históricos nunca sejam perdidos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Exportar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">
              Exportar Backup JSON
            </span>
            <p className="text-[11px] text-slate-500">
              Gera um arquivo com todos os produtos, estoque, vendas e lançamentos financeiros.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer mt-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo .json</span>
            </button>
          </div>

          {/* Importar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">
              Restaurar Backup Existente
            </span>
            <p className="text-[11px] text-slate-500">
              Carregue um arquivo JSON gerado anteriormente para restaurar todas as informações.
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer mt-1"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              <span>Selecionar Arquivo .json</span>
            </button>
          </div>
        </div>

        {/* Zona de Limpeza de Vendas e Caixa */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">
              Limpar Vendas e Caixa (Zerar Registros)
            </span>
            <span className="text-[11px] text-slate-500">
              Zera todo o histórico de vendas, entradas e saídas (R$ 0,00), preservando todos os seus produtos e itens de estoque cadastrados.
            </span>
          </div>

          <button
            onClick={() => {
              clearSalesAndCashData();
              setImportStatus({
                success: true,
                message: 'Vendas, caixa e histórico de movimentações zerados com sucesso! Produtos e estoque preservados.'
              });
              setTimeout(() => setImportStatus(null), 3000);
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Zerar Vendas e Caixa
          </button>
        </div>

        {/* Zona de Perigo / Redefinição */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">
              Redefinir para o Catálogo Padrão
            </span>
            <span className="text-[11px] text-slate-500">
              Restaura a estrutura inicial limpa com massas, picolés e açaí.
            </span>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 text-xs text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Redefinir Sistema
          </button>
        </div>
      </div>

      {/* Modal: Confirmar Redefinição */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-rose-200 p-6 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Redefinir Todos os Dados?
              </h3>
              <p className="text-xs text-slate-600">
                Esta ação apagará as vendas e movimentações atuais e restaurará os dados padrão de inicialização. Recomendamos baixar um backup antes.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Sim, Redefinir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
