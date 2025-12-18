import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectorate } from '@/contexts/DirectorateContext';
import { 
  colaboradoresApi, 
  Colaborador, 
  Estatisticas, 
  CreateColaboradorDto,
  SITUACOES_FUNCIONAIS 
} from '@/services/colaboradoresApi';
import { DIRECTORATES } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Organograma from './Organograma';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X as XIcon, 
  Users, 
  UserCheck, 
  Building2,
  Briefcase,
  GraduationCap,
  UserPlus,
  Loader2,
  Building,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormData {
  colaborador: string;
  unidade_lotacao: string;
  situacao_funcional: string;
  nome_cc_fc: string;
  classe_cc_fc: string;
  cargo_efetivo: string;
  classe_efetivo: string;
}

const initialFormData: FormData = {
  colaborador: '',
  unidade_lotacao: '',
  situacao_funcional: 'ESTATUTÁRIO',
  nome_cc_fc: '',
  classe_cc_fc: '',
  cargo_efetivo: '',
  classe_efetivo: ''
};

// Interface para áreas do organograma
interface AreaOrganograma {
  id: number;
  nome_area: string;
  linha_organograma: number;
}

export function PainelColaboradores() {
  const { user } = useAuth();
  const { selectedDirectorate, setSelectedDirectorate } = useDirectorate();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [filteredColaboradores, setFilteredColaboradores] = useState<Colaborador[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [areasOrganograma, setAreasOrganograma] = useState<AreaOrganograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<number | 'novo' | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const formRowRef = useRef<HTMLTableRowElement>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  
  // Verificar diretoria do usuário
  const userDiretoria = (user as any)?.diretoria || (isAdmin ? 'SGJT' : null);
  const isSGJT = userDiretoria === 'SGJT';

  // Forçar a diretoria do usuário se não for SGJT
  useEffect(() => {
    if (!isSGJT && userDiretoria && selectedDirectorate !== userDiretoria) {
      setSelectedDirectorate(userDiretoria as typeof selectedDirectorate);
    }
  }, [isSGJT, userDiretoria, selectedDirectorate, setSelectedDirectorate]);
  const canEdit = isAdmin || isManager;

  useEffect(() => {
    fetchData();
  }, [selectedDirectorate]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredColaboradores(colaboradores);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = colaboradores.filter(c => 
      c.colaborador.toLowerCase().includes(query) ||
      c.unidade_lotacao.toLowerCase().includes(query) ||
      c.situacao_funcional.toLowerCase().includes(query) ||
      c.nome_cc_fc?.toLowerCase().includes(query) ||
      c.cargo_efetivo?.toLowerCase().includes(query)
    );
    setFilteredColaboradores(filtered);
  }, [colaboradores, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [colaboradoresRes, estatisticasRes, organogramaRes] = await Promise.all([
        colaboradoresApi.getColaboradores(selectedDirectorate),
        colaboradoresApi.getEstatisticas(selectedDirectorate),
        colaboradoresApi.getOrganograma(selectedDirectorate)
      ]);
      setColaboradores(colaboradoresRes);
      setFilteredColaboradores(colaboradoresRes);
      setEstatisticas(estatisticasRes);
      // Extrair áreas do organograma para o dropdown de unidade
      setAreasOrganograma(organogramaRes.map((g: any) => ({
        id: g.id,
        nome_area: g.nome_area,
        linha_organograma: g.linha_organograma
      })));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionar = () => {
    setEditandoId('novo');
    setFormData(initialFormData);
    // Scroll até a linha de criação após o estado ser atualizado
    setTimeout(() => {
      formRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleEditar = (colaborador: Colaborador) => {
    setEditandoId(colaborador.id);
    setFormData({
      colaborador: colaborador.colaborador,
      unidade_lotacao: colaborador.unidade_lotacao,
      situacao_funcional: colaborador.situacao_funcional,
      nome_cc_fc: colaborador.nome_cc_fc || '',
      classe_cc_fc: colaborador.classe_cc_fc || '',
      cargo_efetivo: colaborador.cargo_efetivo || '',
      classe_efetivo: colaborador.classe_efetivo || ''
    });
  };

  const handleSalvar = async () => {
    if (!formData.colaborador.trim() || !formData.unidade_lotacao.trim() || !formData.situacao_funcional) {
      setError('Preencha todos os campos obrigatórios (Nome, Unidade e Situação Funcional)');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data: CreateColaboradorDto = {
        colaborador: formData.colaborador.trim(),
        unidade_lotacao: formData.unidade_lotacao.trim(),
        situacao_funcional: formData.situacao_funcional,
        nome_cc_fc: formData.nome_cc_fc.trim() || null,
        classe_cc_fc: formData.classe_cc_fc.trim() || null,
        cargo_efetivo: formData.cargo_efetivo.trim() || null,
        classe_efetivo: formData.classe_efetivo.trim() || null,
        diretoria: selectedDirectorate
      };

      if (editandoId === 'novo') {
        const novoColaborador = await colaboradoresApi.createColaborador(data);
        setColaboradores(prev => [...prev, novoColaborador]);
      } else if (typeof editandoId === 'number') {
        const atualizado = await colaboradoresApi.updateColaborador(editandoId, data);
        setColaboradores(prev => prev.map(c => c.id === editandoId ? atualizado : c));
      }

      const novasEstatisticas = await colaboradoresApi.getEstatisticas(selectedDirectorate);
      setEstatisticas(novasEstatisticas);

      setEditandoId(null);
      setFormData(initialFormData);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar colaborador');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData(initialFormData);
    setError(null);
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      return;
    }

    try {
      setError(null);
      await colaboradoresApi.deleteColaborador(id);
      setColaboradores(prev => prev.filter(c => c.id !== id));

      const novasEstatisticas = await colaboradoresApi.getEstatisticas(selectedDirectorate);
      setEstatisticas(novasEstatisticas);
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      setError(err.message || 'Erro ao excluir colaborador');
    }
  };

  const getSituacaoBadgeStyle = (situacao: string) => {
    switch (situacao) {
      case 'ESTATUTÁRIO':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'CEDIDO':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'NOMEADO EM COMISSÃO - INSS':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'TERCEIRIZADO':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'RESIDENTE':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-300';
      case 'ESTAGIÁRIO':
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
        <p className="text-white/70">Carregando colaboradores...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 min-h-0">
      {/* Erro Global */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg flex items-center justify-between backdrop-blur-sm flex-shrink-0">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200 transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ===== BARRA DE FILTRO COMPACTA (TOPO) ===== */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSGJT ? (
            // SGJT pode ver todas as diretorias
            <>
              <span className="text-xs font-semibold text-gray-600">Visão SGJT:</span>
              <Select
                value={selectedDirectorate}
                onValueChange={(value) => setSelectedDirectorate(value as typeof selectedDirectorate)}
              >
                <SelectTrigger className="w-40 h-8 text-xs bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTORATES.map(dir => (
                    <SelectItem key={dir.value} value={dir.value} className="text-xs">
                      {dir.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            // Outras diretorias só veem a própria
            <>
              <span className="text-xs font-semibold text-gray-600">Diretoria:</span>
              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded">
                {userDiretoria || selectedDirectorate}
              </span>
            </>
          )}
        </div>

        {canEdit && editandoId === null && (
          <Button 
            onClick={handleAdicionar} 
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar
          </Button>
        )}
      </div>

      {/* ===== ÁREA PRINCIPAL: Organograma (80%) + Estatísticas Compactas (20%) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-3">
        
        {/* ===== ORGANOGRAMA PRINCIPAL - DESTAQUE (80%) ===== */}
        <div className="min-w-0">
          <Organograma 
            diretoria={selectedDirectorate}
            totalColaboradores={estatisticas?.total_colaboradores || 0}
          />
        </div>

        {/* ===== DISTRIBUIÇÃO COMPACTA (220px fixo) ===== */}
        <div className="space-y-1">
          {/* Total de Colaboradores */}
          <div className="bg-[#3D5A80] rounded px-3 py-2 grid grid-cols-3 items-center shadow-sm">
            <span className="text-[10px] font-semibold text-white text-left">Total:</span>
            <span className="text-xl font-bold text-white text-center">{estatisticas?.total_colaboradores || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">100%</span>
          </div>

          {/* Estatutários */}
          <div className="bg-[#3D5A80] rounded px-3 py-1.5 grid grid-cols-3 items-center shadow-sm hover:bg-[#4A6A96] transition-colors">
            <span className="text-[10px] font-semibold text-white text-left">Estatutários:</span>
            <span className="text-lg font-bold text-white text-center">{estatisticas?.total_estatutarios || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">{estatisticas?.percentual_estatutarios || 0}%</span>
          </div>

          {/* Cedidos */}
          <div className="bg-[#3D5A80] rounded px-3 py-1.5 grid grid-cols-3 items-center shadow-sm hover:bg-[#4A6A96] transition-colors">
            <span className="text-[10px] font-semibold text-white text-left">Cedidos:</span>
            <span className="text-lg font-bold text-white text-center">{estatisticas?.total_cedidos || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">{estatisticas?.percentual_cedidos || 0}%</span>
          </div>

          {/* Comissionados Puros */}
          <div className="bg-[#3D5A80] rounded px-3 py-1.5 grid grid-cols-3 items-center shadow-sm hover:bg-[#4A6A96] transition-colors">
            <span className="text-[10px] font-semibold text-white text-left">Comissionados:</span>
            <span className="text-lg font-bold text-white text-center">{estatisticas?.total_comissionados || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">{estatisticas?.percentual_comissionados || 0}%</span>
          </div>

          {/* Terceirizados */}
          <div className="bg-[#3D5A80] rounded px-3 py-1.5 grid grid-cols-3 items-center shadow-sm hover:bg-[#4A6A96] transition-colors">
            <span className="text-[10px] font-semibold text-white text-left">Terceirizados:</span>
            <span className="text-lg font-bold text-white text-center">{estatisticas?.total_terceirizados || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">{estatisticas?.percentual_terceirizados || 0}%</span>
          </div>

          {/* Residentes */}
          <div className="bg-[#3D5A80] rounded px-3 py-1.5 grid grid-cols-3 items-center shadow-sm hover:bg-[#4A6A96] transition-colors">
            <span className="text-[10px] font-semibold text-white text-left">Residentes:</span>
            <span className="text-lg font-bold text-white text-center">{estatisticas?.total_residentes || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">{estatisticas?.percentual_residentes || 0}%</span>
          </div>

          {/* Estagiários */}
          <div className="bg-[#3D5A80] rounded px-3 py-1.5 grid grid-cols-3 items-center shadow-sm hover:bg-[#4A6A96] transition-colors">
            <span className="text-[10px] font-semibold text-white text-left">Estagiários:</span>
            <span className="text-lg font-bold text-white text-center">{estatisticas?.total_estagiarios || 0}</span>
            <span className="text-xs font-semibold text-white/80 text-right">{estatisticas?.percentual_estagiarios || 0}%</span>
          </div>
        </div>
      </div>

      {/* ===== TABELA DE COLABORADORES ===== */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-h-[400px] flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="border-b-2 border-gray-200">
                {/* Grupo 1: Dados Pessoais - Amarelo */}
                <TableHead className="bg-yellow-400 text-gray-900 font-bold text-[11px] uppercase tracking-wider py-2">
                  Colaborador(a)
                </TableHead>
                <TableHead className="bg-yellow-400 text-gray-900 font-bold text-[11px] uppercase tracking-wider py-2">
                  Unidade
                </TableHead>
                <TableHead className="bg-yellow-400 text-gray-900 font-bold text-[11px] uppercase tracking-wider py-2">
                  Situação
                </TableHead>
                
                {/* Grupo 2: CC/FC - Verde */}
                <TableHead className="bg-green-700 text-white font-bold text-[11px] uppercase tracking-wider py-2">
                  CC/FC
                </TableHead>
                <TableHead className="bg-green-700 text-white font-bold text-[11px] uppercase tracking-wider py-2">
                  Classe
                </TableHead>
                
                {/* Grupo 3: Cargo Efetivo - Roxo */}
                <TableHead className="bg-purple-700 text-white font-bold text-[11px] uppercase tracking-wider py-2">
                  Cargo Efetivo
                </TableHead>
                <TableHead className="bg-purple-700 text-white font-bold text-[11px] uppercase tracking-wider py-2">
                  Classe
                </TableHead>
                
                {/* Ações */}
                {canEdit && (
                  <TableHead className="bg-gray-600 text-white font-bold text-[11px] uppercase tracking-wider text-center w-20 py-2">
                    Ações
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Linha de Adição/Edição */}
              {editandoId !== null && (
                <TableRow ref={formRowRef} className="bg-blue-50 hover:bg-blue-50">
                  <TableCell>
                    <Input
                      type="text"
                      value={formData.colaborador}
                      onChange={(e) => setFormData({...formData, colaborador: e.target.value})}
                      placeholder="Nome completo"
                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={formData.unidade_lotacao}
                      onValueChange={(value) => setFormData({...formData, unidade_lotacao: value})}
                    >
                      <SelectTrigger className="h-9 bg-white border-blue-300 min-w-[180px]">
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {areasOrganograma
                          .sort((a, b) => a.linha_organograma - b.linha_organograma || a.nome_area.localeCompare(b.nome_area))
                          .map(area => (
                            <SelectItem key={area.id} value={area.nome_area}>
                              {area.nome_area}
                            </SelectItem>
                          ))}
                        {areasOrganograma.length === 0 && (
                          <SelectItem value="_empty" disabled>
                            Nenhuma área cadastrada no organograma
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={formData.situacao_funcional}
                      onValueChange={(value) => setFormData({...formData, situacao_funcional: value})}
                    >
                      <SelectTrigger className="h-9 bg-white border-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SITUACOES_FUNCIONAIS.map(sit => (
                          <SelectItem key={sit} value={sit}>{sit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={formData.nome_cc_fc}
                      onChange={(e) => setFormData({...formData, nome_cc_fc: e.target.value})}
                      placeholder="Opcional"
                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={formData.classe_cc_fc}
                      onChange={(e) => setFormData({...formData, classe_cc_fc: e.target.value})}
                      placeholder="Opcional"
                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={formData.cargo_efetivo}
                      onChange={(e) => setFormData({...formData, cargo_efetivo: e.target.value})}
                      placeholder="Opcional"
                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={formData.classe_efetivo}
                      onChange={(e) => setFormData({...formData, classe_efetivo: e.target.value})}
                      placeholder="Opcional"
                      className="h-9 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSalvar}
                        disabled={saving}
                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelar}
                        disabled={saving}
                        className="h-8 w-8 p-0 border-gray-400 hover:bg-gray-100"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Linhas de Dados */}
              {filteredColaboradores.map(colaborador => (
                <TableRow key={colaborador.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">
                    {colaborador.colaborador}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {colaborador.unidade_lotacao}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                      getSituacaoBadgeStyle(colaborador.situacao_funcional)
                    )}>
                      {colaborador.situacao_funcional}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {colaborador.nome_cc_fc || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {colaborador.classe_cc_fc || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {colaborador.cargo_efetivo || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {colaborador.classe_efetivo || <span className="text-gray-400">—</span>}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditar(colaborador)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExcluir(colaborador.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {/* Tabela Vazia */}
              {filteredColaboradores.length === 0 && editandoId === null && (
                <TableRow>
                  <TableCell 
                    colSpan={canEdit ? 8 : 7} 
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">Nenhum colaborador encontrado</p>
                      {searchQuery ? (
                        <p className="text-sm text-gray-400 mt-1">
                          Tente ajustar os termos da pesquisa
                        </p>
                      ) : canEdit && (
                        <p className="text-sm text-gray-400 mt-1">
                          Clique em "Adicionar Colaborador" para começar
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé da Tabela */}
        {filteredColaboradores.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 sticky bottom-0">
            <span className="font-semibold">{filteredColaboradores.length}</span> de{' '}
            <span className="font-semibold">{colaboradores.length}</span> colaboradores
            {searchQuery && ' (filtrado)'}
          </div>
        )}
      </div>
    </div>
  );
}
