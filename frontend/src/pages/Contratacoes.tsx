import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EsteiraContratacoes } from '@/components/contratacoes/EsteiraContratacoes';
import { EsteiraRenovacoes } from '@/components/contratacoes/EsteiraRenovacoes';
import { FileText } from 'lucide-react';

export default function Contratacoes() {
  const location = useLocation();
  
  // Renderizar conteúdo baseado na URL
  const renderContent = () => {
    if (location.pathname.includes('/renovacoes')) {
      return <EsteiraRenovacoes />;
    }
    // Padrão: Novas Contratações
    return <EsteiraContratacoes />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Contratações de TI</h1>
            <p className="text-gray-300 text-sm">Gestão de contratações e renovações do PCA 2026</p>
          </div>
        </div>

        {/* Conteúdo baseado na rota */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}
