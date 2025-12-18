import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DirectorateSelector } from '@/components/gestao/DirectorateSelector';
import { VisaoGeral } from '@/components/gestao/VisaoGeral';
import { MonitoramentoOKRs } from '@/components/gestao/MonitoramentoOKRs';
import { ControleExecucao } from '@/components/gestao/ControleExecucao';
import { SprintAtual } from '@/components/gestao/SprintAtual';

export default function GestaoEstrategica() {
  const location = useLocation();

  // Renderizar conteúdo baseado na URL
  const renderContent = () => {
    if (location.pathname === '/gestao-estrategica/okrs') {
      return <MonitoramentoOKRs />;
    }
    if (location.pathname === '/gestao-estrategica/execucao') {
      return <ControleExecucao />;
    }
    if (location.pathname === '/gestao-estrategica/sprint') {
      return <SprintAtual />;
    }
    // Padrão: Visão Geral
    return <VisaoGeral />;
  };

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Gestão Estratégica</h1>
          <p className="text-sm lg:text-base text-white/80 mt-2">
            Acompanhamento de objetivos, KRs e iniciativas estratégicas
          </p>
        </div>

        {/* Seletor de Diretoria */}
        <DirectorateSelector />

        {/* Conteúdo baseado na rota */}
        <div className="space-y-4 lg:space-y-6">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}
