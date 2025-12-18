import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PcaItem, 
  PcaStats, 
  PcaFilters, 
  PcaStatus,
  CreatePcaItemDto,
  UpdatePcaItemDto,
  MESES_ORDENADOS 
} from '@/types';
import { pcaApi, formatCurrency, getStatusBadgeClass } from '@/services/pcaApi';
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
  FileText, 
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
  Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Função helper para truncar nome do responsável
function truncateResponsibleName(fullName: string, maxLength: number = 25): string {
  if (!fullName || fullName.length <= maxLength) return fullName;
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  
  // Primeiro nome completo
  const firstName = parts[0];
  // Último sobrenome completo
  const lastName = parts[parts.length - 1];
  // Nomes do meio como iniciais
  const middleInitials = parts.slice(1, -1).map(name => name[0] + '.').join(' ');
  
  const abbreviated = `${firstName} ${middleInitials} ${lastName}`;
  
  // Se ainda for muito longo, trunca mais agressivamente
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

export function EsteiraContratacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados principais
  const [items, setItems] = useState<PcaItem[]>([]);
  const [stats, setStats] = useState<PcaStats | null>(null);
  const [filters, setFilters] = useState<PcaFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados de filtros ativos
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterResponsavel, setFilterResponsavel] = useState<string>('all');
  const [filterMes, setFilterMes] = useState<string>('all');

  // Estados dos modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PcaItem | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState<CreatePcaItemDto>({
    item_pca: '',
    area_demandante: '',
    responsavel: '',
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
        pcaApi.getPcaItems(),
        pcaApi.getPcaStats(),
        pcaApi.getPcaFilters()
      ]);
      setItems(itemsData);
      setStats(statsData);
      setFilters(filtersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os itens do PCA. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  // Filtrar itens
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterArea !== 'all' && item.area_demandante !== filterArea) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (filterResponsavel !== 'all' && item.responsavel !== filterResponsavel) return false;
      if (filterMes !== 'all' && item.data_estimada_contratacao !== filterMes) return false;
      return true;
    });
  }, [items, filterArea, filterStatus, filterResponsavel, filterMes]);

  // Limpar filtros
  function clearFilters() {
    setFilterArea('all');
    setFilterStatus('all');
    setFilterResponsavel('all');
    setFilterMes('all');
  }

  // Validar formulário
  function validateForm(): boolean {
    const errors: string[] = [];

    if (!formData.item_pca.trim()) {
      errors.push('Item do PCA é obrigatório');
    } else if (formData.item_pca.length > 50) {
      errors.push('Item do PCA deve ter no máximo 50 caracteres');
    }

    if (!formData.area_demandante.trim()) {
      errors.push('Área demandante é obrigatória');
    }

    if (!formData.responsavel.trim()) {
      errors.push('Responsável é obrigatório');
    }

    if (!formData.objeto.trim()) {
      errors.push('Objeto é obrigatório');
    }

    if (!formData.valor_anual || formData.valor_anual <= 0) {
      errors.push('Valor anual deve ser maior que zero');
    }

    if (!formData.data_estimada_contratacao) {
      errors.push('Data estimada de contratação é obrigatória');
    }

    setFormErrors(errors);
    return errors.length === 0;
  }

  // Resetar formulário
  function resetForm() {
    setFormData({
      item_pca: '',
      area_demandante: '',
      responsavel: '',
      objeto: '',
      valor_anual: 0,
      data_estimada_contratacao: '',
      status: 'Não Iniciada'
    });
    setFormErrors([]);
  }

  // Abrir modal de adicionar
  function openAddModal() {
    resetForm();
    setIsAddModalOpen(true);
  }

  // Abrir modal de editar
  function openEditModal(item: PcaItem) {
    setSelectedItem(item);
    setFormData({
      item_pca: item.item_pca,
      area_demandante: item.area_demandante,
      responsavel: item.responsavel,
      objeto: item.objeto,
      valor_anual: item.valor_anual,
      data_estimada_contratacao: item.data_estimada_contratacao,
      status: item.status
    });
    setFormErrors([]);
    setIsEditModalOpen(true);
  }

  // Abrir diálogo de exclusão
  function openDeleteDialog(item: PcaItem) {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }

  // Criar novo item (Optimistic Update)
  async function handleCreate() {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const created = await pcaApi.createPcaItem(formData);
      
      // Optimistic Update - adiciona item à lista imediatamente
      setItems(prev => [...prev, created]);
      
      // Atualiza stats
      if (stats) {
        const newStats = { ...stats, total: stats.total + 1 };
        if (created.status === 'Concluída') newStats.concluidos++;
        else if (created.status === 'Em andamento') newStats.emAndamento++;
        else newStats.naoIniciados++;
        newStats.valorTotal += created.valor_anual;
        setStats(newStats);
      }
      
      toast({
        title: 'Item PCA adicionado',
        description: 'O novo item foi criado com sucesso!',
        duration: 3000
      });
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao criar item:', error);
      toast({
        title: 'Erro ao criar item',
        description: error.message || 'Não foi possível criar o item. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }

  // Atualizar item existente (Optimistic Update)
  async function handleUpdate() {
    if (!selectedItem || !validateForm()) return;

    const oldItem = selectedItem;
    
    try {
      setSaving(true);
      const updateData: UpdatePcaItemDto = {
        item_pca: formData.item_pca,
        area_demandante: formData.area_demandante,
        responsavel: formData.responsavel,
        objeto: formData.objeto,
        valor_anual: formData.valor_anual,
        data_estimada_contratacao: formData.data_estimada_contratacao,
        status: formData.status
      };
      
      const updated = await pcaApi.updatePcaItem(selectedItem.id, updateData);
      
      // Optimistic Update - atualiza item na lista imediatamente
      setItems(prev => prev.map(i => i.id === selectedItem.id ? updated : i));
      
      // Atualiza stats se valor ou status mudou
      if (stats) {
        const newStats = { ...stats };
        // Ajusta valor total
        newStats.valorTotal = newStats.valorTotal - oldItem.valor_anual + updated.valor_anual;
        // Ajusta status se mudou
        if (oldItem.status !== updated.status) {
          if (oldItem.status === 'Concluída') newStats.concluidos--;
          else if (oldItem.status === 'Em andamento') newStats.emAndamento--;
          else newStats.naoIniciados--;
          if (updated.status === 'Concluída') newStats.concluidos++;
          else if (updated.status === 'Em andamento') newStats.emAndamento++;
          else newStats.naoIniciados++;
        }
        setStats(newStats);
      }
      
      toast({
        title: 'Item PCA atualizado',
        description: 'As alterações foram salvas com sucesso!',
        duration: 3000
      });
      setIsEditModalOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: 'Erro ao atualizar item',
        description: error.message || 'Não foi possível atualizar o item. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }

  // Atualizar status inline (Optimistic Update)
  async function handleStatusChange(item: PcaItem, newStatus: PcaStatus) {
    const oldStatus = item.status;
    
    // Optimistic Update - Atualiza UI imediatamente
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: newStatus } : i
    ));
    
    // Atualiza stats localmente
    if (stats) {
      const newStats = { ...stats };
      // Decrementar contador antigo
      if (oldStatus === 'Concluída') newStats.concluidos--;
      else if (oldStatus === 'Em andamento') newStats.emAndamento--;
      else newStats.naoIniciados--;
      // Incrementar contador novo
      if (newStatus === 'Concluída') newStats.concluidos++;
      else if (newStatus === 'Em andamento') newStats.emAndamento++;
      else newStats.naoIniciados++;
      setStats(newStats);
    }
    
    try {
      await pcaApi.updatePcaItemStatus(item.id, newStatus);
      toast({
        title: 'Status atualizado',
        description: `Status alterado para "${newStatus}"`,
        duration: 2000
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      // Reverter em caso de erro
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: oldStatus } : i
      ));
      // Reverter stats
      if (stats) {
        const revertStats = { ...stats };
        if (newStatus === 'Concluída') revertStats.concluidos--;
        else if (newStatus === 'Em andamento') revertStats.emAndamento--;
        else revertStats.naoIniciados--;
        if (oldStatus === 'Concluída') revertStats.concluidos++;
        else if (oldStatus === 'Em andamento') revertStats.emAndamento++;
        else revertStats.naoIniciados++;
        setStats(revertStats);
      }
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Não foi possível atualizar o status. Revertendo...',
        variant: 'destructive'
      });
    }
  }

  // Excluir item (Optimistic Update)
  async function handleDelete() {
    if (!selectedItem) return;

    const deletedItem = selectedItem;
    
    // Optimistic Update - remove item da lista imediatamente
    setItems(prev => prev.filter(i => i.id !== selectedItem.id));
    
    // Atualiza stats
    if (stats) {
      const newStats = { ...stats, total: stats.total - 1 };
      if (deletedItem.status === 'Concluída') newStats.concluidos--;
      else if (deletedItem.status === 'Em andamento') newStats.emAndamento--;
      else newStats.naoIniciados--;
      newStats.valorTotal -= deletedItem.valor_anual;
      setStats(newStats);
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);

    try {
      setSaving(true);
      await pcaApi.deletePcaItem(deletedItem.id);
      toast({
        title: 'Item PCA excluído',
        description: 'O item foi removido com sucesso!',
        duration: 3000
      });
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      // Reverter em caso de erro
      setItems(prev => [...prev, deletedItem]);
      if (stats) {
        const revertStats = { ...stats, total: stats.total + 1 };
        if (deletedItem.status === 'Concluída') revertStats.concluidos++;
        else if (deletedItem.status === 'Em andamento') revertStats.emAndamento++;
        else revertStats.naoIniciados++;
        revertStats.valorTotal += deletedItem.valor_anual;
        setStats(revertStats);
      }
      toast({
        title: 'Erro ao excluir item',
        description: error.message || 'Não foi possível excluir o item. Revertendo...',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }

  // Renderizar status badge
  function renderStatusBadge(status: PcaStatus) {
    return (
      <Badge className={getStatusBadgeClass(status)}>
        {status}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do PCA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            PCA 2026 - Plano de Contratações Anual
          </h2>
        </div>
        {canEdit && (
          <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item PCA
          </Button>
        )}
      </div>

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Itens</p>
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
                  <p className="text-sm text-gray-500">Concluídos</p>
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
                  <p className="text-sm text-gray-500">Não Iniciados</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.naoIniciados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="bg-blue-100 border-2 border-blue-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
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
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filters?.statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filters?.responsaveis.map(resp => (
                    <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
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

      {/* Lista de Itens (Accordion) */}
      <div className="space-y-2">
        <p className="text-sm text-white">
          Exibindo {filteredItems.length} de {items.length} itens
        </p>
        
        <Accordion type="multiple" className="space-y-2">
          {filteredItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={`item-${item.id}`}
              className="bg-white rounded-lg border-2 border-blue-400 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50/50 rounded-t-lg">
                <div className="flex flex-col w-full gap-2 text-left pr-4">
                  {/* Linha 1: Header Compacto - PCA | Área | Responsável | Valor | Mês | Badge */}
                  <div className="flex items-center justify-between w-full gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* PCA + Área */}
                      <span className="font-bold text-blue-700 text-[15px]">{item.item_pca}</span>
                      <span className="text-gray-400">-</span>
                      <span className="font-bold text-blue-700 text-[15px]">{item.area_demandante}</span>
                      
                      {/* Separador */}
                      <span className="text-gray-300 hidden sm:inline">|</span>
                      
                      {/* Responsável com Tooltip */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-gray-600 text-sm hidden sm:inline cursor-default">
                              {truncateResponsibleName(item.responsavel, 22)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.responsavel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
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
                    {renderStatusBadge(item.status)}
                  </div>
                  
                  {/* Linha 2+: Objeto COMPLETO */}
                  <p className="text-[13px] text-gray-600 leading-relaxed pl-0 sm:pl-0">
                    {item.objeto}
                  </p>
                  
                  {/* Linha Mobile: Info adicional */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:hidden">
                    <span>{truncateResponsibleName(item.responsavel, 20)}</span>
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
                      <Label className="text-gray-500 text-xs uppercase">Responsável</Label>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {item.responsavel}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs uppercase">Valor Anual</Label>
                      <p className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        {formatCurrency(item.valor_anual)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Objeto</Label>
                    <p className="mt-1 text-gray-700">{item.objeto}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500 text-xs uppercase">Previsão de Contratação</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {item.data_estimada_contratacao}
                      </p>
                    </div>
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
                        <p className="mt-1">{renderStatusBadge(item.status)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/contratacoes-ti/item/${item.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    {canEdit && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar Item
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum item encontrado</h3>
            <p className="text-gray-500 mt-1">
              {items.length === 0 
                ? 'Não há itens no PCA ainda.' 
                : 'Nenhum item corresponde aos filtros selecionados.'}
            </p>
            {items.length > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Adicionar */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Item PCA</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para adicionar um novo item ao Plano de Contratações.
            </DialogDescription>
          </DialogHeader>
          
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">Corrija os erros abaixo:</p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1">
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
                  placeholder="Ex: PCA 275"
                  value={formData.item_pca}
                  onChange={(e) => setFormData({ ...formData, item_pca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_demandante">Área Demandante *</Label>
                <Input
                  id="area_demandante"
                  placeholder="Ex: DTI, DSTI, CITEC..."
                  value={formData.area_demandante}
                  onChange={(e) => setFormData({ ...formData, area_demandante: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                placeholder="Nome completo do responsável"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objeto">Objeto *</Label>
              <Textarea
                id="objeto"
                placeholder="Descrição detalhada da contratação"
                rows={4}
                value={formData.objeto}
                onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
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
                  placeholder="0,00"
                  value={formData.valor_anual || ''}
                  onChange={(e) => setFormData({ ...formData, valor_anual: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_estimada">Data Estimada *</Label>
                <Select 
                  value={formData.data_estimada_contratacao} 
                  onValueChange={(value) => setFormData({ ...formData, data_estimada_contratacao: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
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
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Item PCA {selectedItem?.item_pca}</DialogTitle>
            <DialogDescription>
              Altere os campos desejados e clique em Salvar.
            </DialogDescription>
          </DialogHeader>
          
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">Corrija os erros abaixo:</p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1">
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
                  placeholder="Ex: PCA 275"
                  value={formData.item_pca}
                  onChange={(e) => setFormData({ ...formData, item_pca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_area_demandante">Área Demandante *</Label>
                <Input
                  id="edit_area_demandante"
                  placeholder="Ex: DTI, DSTI, CITEC..."
                  value={formData.area_demandante}
                  onChange={(e) => setFormData({ ...formData, area_demandante: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_responsavel">Responsável *</Label>
              <Input
                id="edit_responsavel"
                placeholder="Nome completo do responsável"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_objeto">Objeto *</Label>
              <Textarea
                id="edit_objeto"
                placeholder="Descrição detalhada da contratação"
                rows={4}
                value={formData.objeto}
                onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
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
                  placeholder="0,00"
                  value={formData.valor_anual || ''}
                  onChange={(e) => setFormData({ ...formData, valor_anual: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_data_estimada">Data Estimada *</Label>
                <Select 
                  value={formData.data_estimada_contratacao} 
                  onValueChange={(value) => setFormData({ ...formData, data_estimada_contratacao: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
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
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item <strong>{selectedItem?.item_pca}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

