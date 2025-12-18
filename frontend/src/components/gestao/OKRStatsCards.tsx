import { useMemo } from 'react';
import { useGestao } from '@/contexts/GestaoContext';
import { useDirectorate } from '@/contexts/DirectorateContext';
import { CardIndicador } from './CardIndicador';
import { Target, CheckCircle, Clock, PlayCircle, TrendingUp } from 'lucide-react';

export function OKRStatsCards() {
  const { keyResults } = useGestao();
  const { selectedDirectorate } = useDirectorate();

  const stats = useMemo(() => {
    const filteredKRs = keyResults.filter(kr => kr.directorate === selectedDirectorate);
    const total = filteredKRs.length;
    const concluido = filteredKRs.filter(kr => kr.status === 'CONCLUIDO').length;
    const emAndamento = filteredKRs.filter(kr => kr.status === 'EM_ANDAMENTO').length;
    const aIniciar = filteredKRs.filter(kr => kr.status === 'NAO_INICIADO').length;
    const progresso = total > 0 ? Math.round((concluido / total) * 100) : 0;

    return { total, concluido, emAndamento, aIniciar, progresso };
  }, [keyResults, selectedDirectorate]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <CardIndicador title="Totais" value={stats.total} icon={Target} color="teal" />
      <CardIndicador title="Concluído" value={stats.concluido} icon={CheckCircle} color="green" />
      <CardIndicador title="Em Andamento" value={stats.emAndamento} icon={Clock} color="yellow" />
      <CardIndicador title="A iniciar" value={stats.aIniciar} icon={PlayCircle} color="orange" />
      <CardIndicador title="Progresso" value={`${stats.progresso}%`} icon={TrendingUp} color="teal" />
    </div>
  );
}