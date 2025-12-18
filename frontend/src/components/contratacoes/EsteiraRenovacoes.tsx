import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PcaRenovacao, 
  RenovacaoStats, 
  RenovacaoFilters, 
  PcaStatus,
  CreateRenovacaoDto,
  UpdateRenovacaoDto,
  MESES_ORDENADOS 
} from '@/types';
import { renovacoesApi } from '@/services/renovacoesApi';
import { formatCurrency, getStatusBadgeClass } from '@/services/pcaApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  Filter, 
  X,
  DollarSign,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Briefcase
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Função helper para truncar nome do gestor
function truncateGestorName(fullName: string, maxLength: number = 25): string {
  if (!fullName || fullName.length <= maxLength) return fullName;
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleInitials = parts.slice(1, -1).map(name => name[0] + '.').join(' ');
  
  const abbreviated = `${firstName} ${middleInitials} ${lastName}`;
  
  if (abbreviated.length > maxLength) {
    return `${firstName} ${lastName.substring(0, 1)}.`;
  }
  
  return abbreviated;
}

// Função helper para abreviar mês
function abbreviateMonth(month: string): string {
  const abbreviations: Record<string, string> = {
    'Janeiro': 'Jan',
    'Fevereiro': 'Fev',
    'Março': 'Mar',
    'Abril': 'Abr',
    'Maio': 'Mai',
    'Junho': 'Jun',
    'Julho': 'Jul',
    'Agosto': 'Ago',
    'Setembro': 'Set',
    'Outubro': 'Out',
    'Novembro': 'Nov',
    'Dezembro': 'Dez'
  };
  return abbreviations[month] || month;
}

// Função helper para formatar valor compacto
function formatValueCompact(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

export function EsteiraRenovacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados principais
  const [items, setItems] = useState<PcaRenovacao[]>([]);
  const [stats, setStats] = useState<RenovacaoStats | null>(null);
  const [filters, setFilters] = useState<RenovacaoFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados de filtros ativos
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGestor, setFilterGestor] = useState<string>('all');
  const [filterMes, setFilterMes] = useState<string>('all');

  // Estados dos modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PcaRenovacao | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState<CreateRenovacaoDto>({
    item_pca: '',
    area_demandante: '',
    gestor_demandante: '',
    contratada: '',
    objeto: '',
    valor_anual: 0,
    data_estimada_contratacao: '',
    status: 'Não Iniciada'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Verificar se usuário pode editar (MANAGER ou ADMIN)
  const canEdit = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [itemsData, statsData, filtersData] = await Promise.all([
        renovacoesApi.getAll(),
        renovacoesApi.getStats(),
        renovacoesApi.getFilters()
      ]);
      
      console.log('📊 Dados carregados:', {
        items: Array.isArray(itemsData) ? itemsData.length : 0,
        stats: statsData,
        filters: filtersData
      });
      
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setStats(statsData || null);
      setFilters(filtersData || null);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro desconhecido';
      toast({
        title: 'Erro ao carregar dados',
        description: `Não foi possível carregar as renovações: ${errorMessage}`,
        variant: 'destructive'
      });
      // Garantir que arrays estão inicializados mesmo em caso de erro
      setItems([]);
      setStats(null);
      setFilters(null);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar itens
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterArea !== 'all' && item.area_demandante !== filterArea) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (filterGestor !== 'all' && item.gestor_demandante !== filterGestor) return false;
      if (filterMes !== 'all' && item.data_estimada_contratacao !== filterMes) return false;
      return true;
    });
  }, [items, filterArea, filterStatus, filterGestor, filterMes]);

  // Verificar se há filtros ativos
  const hasActiveFilters = filterArea !== 'all' || filterStatus !== 'all' || filterGestor !== 'all' || filterMes !== 'all';

  // Limpar todos os filtros
  function clearFilters() {
    setFilterArea('all');
    setFilterStatus('all');
    setFilterGestor('all');
    setFilterMes('all');
  }

  // Abrir modal de adicionar
  function openAddModal() {
    setFormData({
      item_pca: '',
      area_demandante: '',
      gestor_demandante: '',
      contratada: '',
      objeto: '',
      valor_anual: 0,
      data_estimada_contratacao: '',
      status: 'Não Iniciada'
    });
    setFormErrors([]);
    setIsAddModalOpen(true);
  }

  // Abrir modal de editar
  function openEditModal(item: PcaRenovacao) {
    setSelectedItem(item);
    setFormData({
      item_pca: item.item_pca,
      area_demandante: item.area_demandante,
      gestor_demandante: item.gestor_demandante,
      contratada: item.contratada,
      objeto: item.objeto,
      valor_anual: item.valor_anual,
      data_estimada_contratacao: item.data_estimada_contratacao,
      status: item.status
    });
    setFormErrors([]);
    setIsEditModalOpen(true);
  }

  // Abrir dialog de deletar
  function openDeleteDialog(item: PcaRenovacao) {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }

  // Validar formulário
  function validateForm(): boolean {
    const errors: string[] = [];
    
    if (!formData.item_pca.trim()) errors.push('Item PCA é obrigatório');
    if (formData.item_pca.length > 50) errors.push('Item PCA deve ter no máximo 50 caracteres');
    if (!formData.area_demandante.trim()) errors.push('Área Demandante é obrigatória');
    if (!formData.gestor_demandante.trim()) errors.push('Gestor Demandante é obrigatório');
    if (formData.gestor_demandante.length > 255) errors.push('Gestor Demandante deve ter no máximo 255 caracteres');
    if (!formData.contratada.trim()) errors.push('Contratada é obrigatória');
    if (formData.contratada.length > 255) errors.push('Contratada deve ter no máximo 255 caracteres');
    if (!formData.objeto.trim()) errors.push('Objeto é obrigatório');
    if (formData.objeto.length < 10) errors.push('Objeto deve ter pelo menos 10 caracteres');
    if (!formData.valor_anual || formData.valor_anual <= 0) errors.push('Valor anual deve ser maior que zero');
    if (!formData.data_estimada_contratacao) errors.push('Data estimada de renovação é obrigatória');
    
    setFormErrors(errors);
    return errors.length === 0;
  }

  // Criar nova renovação
  async function handleCreate() {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      console.log('📝 Criando renovação:', formData);
      const created = await renovacoesApi.create(formData);
      console.log('✅ Renovação criada:', created);
      
      // Optimistic update
      setItems(prev => [...prev, created]);
      setStats(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        valorTotal: prev.valorTotal + created.valor_anual,
        naoIniciados: prev.naoIniciados + 1
      } : null);
      
      setIsAddModalOpen(false);
      toast({
        title: 'Renovação criada',
        description: `${created.item_pca} foi adicionada com sucesso.`
      });
      
      // Recarregar filtros
      const filtersData = await renovacoesApi.getFilters();
      setFilters(filtersData);
    } catch (error: any) {
      console.error('❌ Erro ao criar renovação:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro desconhecido';
      const statusCode = error?.response?.status;
      
      let description = `Não foi possível criar a renovação.`;
      if (statusCode === 403) {
        description = 'Você não tem permissão para criar renovações. Apenas gestores e administradores podem realizar esta operação.';
      } else if (statusCode === 409) {
        description = errorMessage;
      } else if (errorMessage) {
        description = errorMessage;
      }
      
      toast({
        title: 'Erro ao criar renovação',
        description,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }

  // Atualizar renovação
  async function handleUpdate() {
    if (!selectedItem || !validateForm()) return;
    
    try {
      setSaving(true);
      const updated = await renovacoesApi.update(selectedItem.id, formData);
      
      // Optimistic update
      setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      
      // Atualizar stats se valor mudou
      if (selectedItem.valor_anual !== updated.valor_anual) {
        setStats(prev => prev ? {
          ...prev,
          valorTotal: prev.valorTotal - selectedItem.valor_anual + updated.valor_anual
        } : null);
      }
      
      setIsEditModalOpen(false);
      toast({
        title: 'Renovação atualizada',
        description: `${updated.item_pca} foi atualizada com sucesso.`
      });
      
      // Recarregar filtros
      const filtersData = await renovacoesApi.getFilters();
      setFilters(filtersData);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: 'Erro ao atualizar renovação',
        description: error?.response?.data?.error || 'Não foi possível atualizar a renovação.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }

  // Deletar renovação
  async function handleDelete() {
    if (!selectedItem) return;
    
    try {
      setSaving(true);
      await renovacoesApi.delete(selectedItem.id);
      
      // Optimistic update
      setItems(prev => prev.filter(item => item.id !== selectedItem.id));
      setStats(prev => prev ? {
        ...prev,
        total: prev.total - 1,
        valorTotal: prev.valorTotal - selectedItem.valor_anual,
        naoIniciados: selectedItem.status === 'Não Iniciada' ? prev.naoIniciados - 1 : prev.naoIniciados,
        emAndamento: selectedItem.status === 'Em andamento' ? prev.emAndamento - 1 : prev.emAndamento,
        concluidos: selectedItem.status === 'Concluída' ? prev.concluidos - 1 : prev.concluidos,
      } : null);
      
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Renovação excluída',
        description: `${selectedItem.item_pca} foi excluída com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro ao excluir renovação',
        description: 'Não foi possível excluir a renovação.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }

  // Atualizar status inline
  async function handleStatusChange(item: PcaRenovacao, newStatus: PcaStatus) {
    const oldStatus = item.status;
    
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    setStats(prev => {
      if (!prev) return null;
      const newStats = { ...prev };
      if (oldStatus === 'Não Iniciada') newStats.naoIniciados--;
      if (oldStatus === 'Em andamento') newStats.emAndamento--;
      if (oldStatus === 'Concluída') newStats.concluidos--;
      if (newStatus === 'Não Iniciada') newStats.naoIniciados++;
      if (newStatus === 'Em andamento') newStats.emAndamento++;
      if (newStatus === 'Concluída') newStats.concluidos++;
      return newStats;
    });

    try {
      await renovacoesApi.updateStatus(item.id, newStatus);
      toast({
        title: 'Status atualizado',
        description: `Status de ${item.item_pca} alterado para ${newStatus}.`
      });
    } catch (error) {
      // Rollback
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: oldStatus } : i));
      setStats(prev => {
        if (!prev) return null;
        const newStats = { ...prev };
        if (newStatus === 'Não Iniciada') newStats.naoIniciados--;
        if (newStatus === 'Em andamento') newStats.emAndamento--;
        if (newStatus === 'Concluída') newStats.concluidos--;
        if (oldStatus === 'Não Iniciada') newStats.naoIniciados++;
        if (oldStatus === 'Em andamento') newStats.emAndamento++;
        if (oldStatus === 'Concluída') newStats.concluidos++;
        return newStats;
      });
      
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      });
    }
  }

  // Navegação para detalhes removida (não implementada ainda)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-400">Carregando renovações...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Cabeçalho Compacto */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Renovações - PCA 2026
            </h2>
          </div>
          {canEdit && (
            <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Renovação
            </Button>
          )}
        </div>

        {/* Cards de Estatísticas - 5 Cards Individuais Brancos */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Renovações</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Concluídas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Em Andamento</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.emAndamento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Não Iniciadas</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.naoIniciados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros - Card Único Branco */}
        <Card className="bg-emerald-100 border-2 border-emerald-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Área Demandante</Label>
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {filters?.areasDemandantes.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gestor Demandante</Label>
                <Select value={filterGestor} onValueChange={setFilterGestor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {filters?.gestores.map(gestor => (
                      <SelectItem key={gestor} value={gestor}>{gestor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Não Iniciada">Não Iniciada</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês de Renovação</Label>
                <Select value={filterMes} onValueChange={setFilterMes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {filters?.meses.map(mes => (
                      <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contador de itens */}
        <div className="text-sm text-white">
          Exibindo {filteredItems.length} de {items.length} renovações
        </div>

        {/* Lista de Cards */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma renovação encontrada</h3>
              <p className="text-gray-500 mt-1">
                {items.length === 0 
                  ? 'Não há renovações cadastradas ainda.' 
                  : 'Nenhuma renovação corresponde aos filtros selecionados.'}
              </p>
              {items.length > 0 && hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {filteredItems.map(item => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id.toString()}
                  className="bg-white rounded-lg border-2 border-emerald-500 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50/50 rounded-t-lg">
                    <div className="flex flex-col w-full gap-2 text-left pr-4">
                      {/* Linha 1: Header Compacto - PCA | Área | Gestor | Valor | Mês | Badge */}
                      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* PCA + Área */}
                          <span className="font-bold text-blue-700 text-[15px]">{item.item_pca}</span>
                          <span className="text-gray-400">-</span>
                          <span className="font-bold text-blue-700 text-[15px]">{item.area_demandante}</span>
                          
                          {/* Separador */}
                          <span className="text-gray-300 hidden sm:inline">|</span>
                          
                          {/* Gestor com Tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-600 text-sm hidden sm:inline cursor-default">
                                {truncateGestorName(item.gestor_demandante, 22)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.gestor_demandante}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Separador */}
                          <span className="text-gray-300 hidden md:inline">|</span>
                          
                          {/* Valor */}
                          <span className="font-semibold text-emerald-700 text-sm hidden md:inline">
                            {formatCurrency(item.valor_anual)}
                          </span>
                          
                          {/* Separador */}
                          <span className="text-gray-300 hidden lg:inline">|</span>
                          
                          {/* Mês */}
                          <span className="text-gray-600 text-sm hidden lg:inline">
                            {abbreviateMonth(item.data_estimada_contratacao)}
                          </span>
                        </div>
                        
                        {/* Badge de Status */}
                        <Badge className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      
                      {/* Linha 2+: Objeto COMPLETO */}
                      <p className="text-[13px] text-gray-600 leading-relaxed pl-0 sm:pl-0">
                        {item.objeto}
                      </p>
                      
                      {/* Linha Mobile: Info adicional */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:hidden">
                        <span>{truncateGestorName(item.gestor_demandante, 20)}</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-medium text-emerald-700">{formatValueCompact(item.valor_anual)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{abbreviateMonth(item.data_estimada_contratacao)}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Item do PCA</Label>
                          <p className="font-medium">{item.item_pca}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Área Demandante</Label>
                          <p className="font-medium flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            {item.area_demandante}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Gestor Demandante</Label>
                          <p className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {item.gestor_demandante}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Contratada</Label>
                          <p className="font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            {item.contratada}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Valor Anual</Label>
                          <p className="font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            {formatCurrency(item.valor_anual)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Previsão de Renovação</Label>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {item.data_estimada_contratacao}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-gray-500 text-xs uppercase">Objeto</Label>
                        <p className="mt-1 text-gray-700">{item.objeto}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500 text-xs uppercase">Status</Label>
                          {canEdit ? (
                            <Select 
                              value={item.status} 
                              onValueChange={(value: PcaStatus) => handleStatusChange(item, value)}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Não Iniciada">Não Iniciada</SelectItem>
                                <SelectItem value="Em andamento">Em andamento</SelectItem>
                                <SelectItem value="Concluída">Concluída</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="mt-1">
                              <Badge className={getStatusBadgeClass(item.status)}>
                                {item.status}
                              </Badge>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {canEdit && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditModal(item)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar Renovação
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(item)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Modal de Adicionar */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Renovação</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova renovação ao PCA.
              </DialogDescription>
            </DialogHeader>
            
            {formErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <ul className="text-sm text-red-400 list-disc list-inside">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_pca">Item do PCA *</Label>
                  <Input
                    id="item_pca"
                    placeholder="Ex: PCA 300"
                    value={formData.item_pca}
                    onChange={(e) => setFormData({ ...formData, item_pca: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area_demandante">Área Demandante *</Label>
                  <Input
                    id="area_demandante"
                    placeholder="Ex: CITEC, CSTI..."
                    value={formData.area_demandante}
                    onChange={(e) => setFormData({ ...formData, area_demandante: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gestor_demandante">Gestor Demandante *</Label>
                <Input
                  id="gestor_demandante"
                  placeholder="Nome completo do gestor"
                  value={formData.gestor_demandante}
                  onChange={(e) => setFormData({ ...formData, gestor_demandante: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contratada">Contratada *</Label>
                <Input
                  id="contratada"
                  placeholder="Nome da empresa contratada"
                  value={formData.contratada}
                  onChange={(e) => setFormData({ ...formData, contratada: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objeto">Objeto *</Label>
                <Textarea
                  id="objeto"
                  placeholder="Descrição detalhada do objeto da renovação (mínimo 10 caracteres)"
                  value={formData.objeto}
                  onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_anual">Valor Anual (R$) *</Label>
                  <Input
                    id="valor_anual"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.valor_anual || ''}
                    onChange={(e) => setFormData({ ...formData, valor_anual: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_estimada">Data Estimada de Renovação *</Label>
                  <Select 
                    value={formData.data_estimada_contratacao} 
                    onValueChange={(value) => setFormData({ ...formData, data_estimada_contratacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES_ORDENADOS.map(mes => (
                        <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: PcaStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não Iniciada">Não Iniciada</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Editar */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Renovação</DialogTitle>
              <DialogDescription>
                Atualize os campos abaixo.
              </DialogDescription>
            </DialogHeader>
            
            {formErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <ul className="text-sm text-red-400 list-disc list-inside">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_item_pca">Item do PCA *</Label>
                  <Input
                    id="edit_item_pca"
                    placeholder="Ex: PCA 300"
                    value={formData.item_pca}
                    onChange={(e) => setFormData({ ...formData, item_pca: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_area_demandante">Área Demandante *</Label>
                  <Input
                    id="edit_area_demandante"
                    placeholder="Ex: CITEC, CSTI..."
                    value={formData.area_demandante}
                    onChange={(e) => setFormData({ ...formData, area_demandante: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_gestor_demandante">Gestor Demandante *</Label>
                <Input
                  id="edit_gestor_demandante"
                  placeholder="Nome completo do gestor"
                  value={formData.gestor_demandante}
                  onChange={(e) => setFormData({ ...formData, gestor_demandante: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_contratada">Contratada *</Label>
                <Input
                  id="edit_contratada"
                  placeholder="Nome da empresa contratada"
                  value={formData.contratada}
                  onChange={(e) => setFormData({ ...formData, contratada: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_objeto">Objeto *</Label>
                <Textarea
                  id="edit_objeto"
                  placeholder="Descrição detalhada do objeto da renovação"
                  value={formData.objeto}
                  onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_valor_anual">Valor Anual (R$) *</Label>
                  <Input
                    id="edit_valor_anual"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.valor_anual || ''}
                    onChange={(e) => setFormData({ ...formData, valor_anual: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_data_estimada">Data Estimada de Renovação *</Label>
                  <Select 
                    value={formData.data_estimada_contratacao} 
                    onValueChange={(value) => setFormData({ ...formData, data_estimada_contratacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES_ORDENADOS.map(mes => (
                        <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: PcaStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não Iniciada">Não Iniciada</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Atualizar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a renovação <strong>{selectedItem?.item_pca}</strong>?
                <br /><br />
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-red-600 hover:bg-red-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

