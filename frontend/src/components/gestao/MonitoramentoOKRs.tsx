import { useState, useMemo } from 'react';
import { useGestao } from '@/contexts/GestaoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectorate } from '@/contexts/DirectorateContext';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/services/api';
import { Objective, KeyResult, OKRStatus, OKRSituation } from '@/types';
import { OKRStatsCards } from './OKRStatsCards';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export function MonitoramentoOKRs() {
  const { objectives, keyResults, refreshData } = useGestao();
  const { user } = useAuth();
  const { selectedDirectorate } = useDirectorate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [krDialogOpen, setKrDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null);
  const [editingKRStatus, setEditingKRStatus] = useState<KeyResult | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');
  
  // Estados de loading e erro
  const [savingObjective, setSavingObjective] = useState(false);
  const [savingKR, setSavingKR] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  // Apenas ADMIN pode criar/editar/excluir
  const canFullEdit = user?.role === 'ADMIN';
  // GESTOR pode apenas alterar o STATUS das KRs
  const canEditStatus = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // Filtrar por diretoria
  const filteredObjectives = useMemo(() => {
    return objectives.filter(obj => obj.directorate === selectedDirectorate);
  }, [objectives, selectedDirectorate]);

  const filteredKeyResults = useMemo(() => {
    return keyResults.filter(kr => kr.directorate === selectedDirectorate);
  }, [keyResults, selectedDirectorate]);

  const handleSaveObjective = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('[MonitoramentoOKRs] handleSaveObjective chamado');
    
    const formData = new FormData(e.currentTarget);

    const code = formData.get('code') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validação no frontend
    if (!code?.trim() || !title?.trim()) {
      alert('Por favor, preencha os campos obrigatórios: Código e Título');
      return;
    }

    const data = {
      code: code.trim(),
      title: title.trim(),
      description: description?.trim() || '',
      directorate: selectedDirectorate
    };

    console.log('[MonitoramentoOKRs] Dados a enviar:', data);
    
    setSavingObjective(true);

    try {
      if (editingObjective) {
        console.log('[MonitoramentoOKRs] Atualizando objetivo:', editingObjective.id);
        await api.updateObjective(editingObjective.id, data);
        alert('Objetivo atualizado com sucesso!');
      } else {
        console.log('[MonitoramentoOKRs] Criando novo objetivo');
        const result = await api.createObjective(data);
        console.log('[MonitoramentoOKRs] Objetivo criado:', result);
        alert('Objetivo criado com sucesso!');
      }
      
      await refreshData();
      setDialogOpen(false);
      setEditingObjective(null);
      
      // Limpar formulário (resetar o form)
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('[MonitoramentoOKRs] Erro ao salvar objetivo:', error);
      
      // Mostrar mensagem de erro específica
      if (error.status === 409) {
        alert('Erro: Já existe um objetivo com este código nesta diretoria.');
      } else if (error.status === 400) {
        alert('Erro: Dados inválidos. Verifique os campos e tente novamente.');
      } else {
        alert(`Erro ao salvar objetivo: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setSavingObjective(false);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este objetivo e todos os seus KRs?')) {
      try {
        await api.deleteObjective(id);
        await refreshData();
      } catch (error) {
        console.error('Erro ao excluir objetivo:', error);
      }
    }
  };

  const handleSaveKR = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);

    const objectiveId = formData.get('objectiveId') as string;
    const code = formData.get('code') as string;
    const description = formData.get('description') as string;

    if (!objectiveId || !code?.trim() || !description?.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const data = {
      objectiveId,
      code: code.trim(),
      description: description.trim(),
      status: formData.get('status') as OKRStatus,
      situation: (formData.get('situation') as OKRSituation) || 'NO_PRAZO',
      deadline: formData.get('deadline') as string,
      directorate: selectedDirectorate
    };

    setSavingKR(true);

    try {
      if (editingKR) {
        await api.updateKeyResult(editingKR.id, data);
        alert('Key Result atualizado com sucesso!');
      } else {
        await api.createKeyResult(data);
        alert('Key Result criado com sucesso!');
      }
      await refreshData();
      setKrDialogOpen(false);
      setEditingKR(null);
    } catch (error: any) {
      console.error('Erro ao salvar KR:', error);
      alert(`Erro ao salvar Key Result: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSavingKR(false);
    }
  };

  const handleSaveKRStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!editingKRStatus) return;

    const data = {
      status: formData.get('status') as OKRStatus
    };

    setSavingStatus(true);

    try {
      await api.updateKeyResult(editingKRStatus.id, data);
      alert('Status atualizado com sucesso!');
      await refreshData();
      setStatusDialogOpen(false);
      setEditingKRStatus(null);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      alert(`Erro ao atualizar status: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteKR = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este KR?')) {
      try {
        await api.deleteKeyResult(id);
        await refreshData();
      } catch (error) {
        console.error('Erro ao excluir KR:', error);
      }
    }
  };

  const getStatusBadge = (status: OKRStatus) => {
    const config = {
      CONCLUIDO: { variant: 'default' as BadgeVariant, label: 'Concluído', className: 'bg-green-500 hover:bg-green-600 text-white border-0' },
      EM_ANDAMENTO: { variant: 'default' as BadgeVariant, label: 'Em andamento', className: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0' },
      NAO_INICIADO: { variant: 'default' as BadgeVariant, label: 'Não iniciado', className: 'bg-orange-400 hover:bg-orange-500 text-white border-0' }
    };
    const { variant, label, className } = config[status];
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const getSituationBadge = (situation: OKRSituation) => {
    const config = {
      NO_PRAZO: { label: 'No prazo', className: 'bg-blue-500 hover:bg-blue-600 text-white border-0' },
      FINALIZADO: { label: 'Finalizado', className: 'bg-green-500 hover:bg-green-600 text-white border-0' },
      EM_ATRASO: { label: 'Em atraso', className: 'bg-red-500 hover:bg-red-600 text-white border-0' }
    };
    const { label, className } = config[situation];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Bolachinhas - Cards de Estatísticas */}
      <OKRStatsCards />

      {/* Botão Novo Objetivo - Apenas para ADMIN */}
      {canFullEdit && (
        <div className="flex justify-end">
          <Button onClick={() => { setEditingObjective(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Novo Objetivo</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      )}

      {/* Tabela de Objetivos e KRs */}
      <div className="space-y-3">
        {/* Badge de Título - Independente */}
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-[#1e5a7d] to-[#2980b9] px-6 py-2.5 rounded-lg shadow-md">
            <h3 className="text-white font-bold text-base lg:text-lg tracking-wide">
              OBJETIVO E DESCRIÇÃO
            </h3>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-[#1e5a7d]/50 to-transparent ml-4" />
        </div>

        {/* Tabela */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-100 border-b-2 border-[#1e5a7d]">
                  <tr>
                    <th className="text-left p-2 lg:p-4 font-semibold text-xs lg:text-sm text-gray-700">DESCRIÇÃO</th>
                    <th className="text-center p-2 lg:p-4 font-semibold text-xs lg:text-sm text-gray-700 w-32">STATUS</th>
                    <th className="text-center p-2 lg:p-4 font-semibold text-xs lg:text-sm text-gray-700 w-32">SITUAÇÃO</th>
                    <th className="text-center p-2 lg:p-4 font-semibold text-xs lg:text-sm text-gray-700 w-32 lg:w-40">PRAZO</th>
                    {(canFullEdit || canEditStatus) && <th className="text-center p-2 lg:p-4 font-semibold text-xs lg:text-sm text-gray-700 w-24 lg:w-32">AÇÕES</th>}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredObjectives.map((obj) => {
                    // Converter IDs para string para garantir comparação correta
                    const objKRs = filteredKeyResults.filter(kr => String(kr.objectiveId) === String(obj.id));

                    return (
                      <>
                        {/* Linha do Objetivo */}
                        <tr key={obj.id} className="border-b bg-[#1e5a7d]/5">
                          <td className="p-2 lg:p-4" colSpan={(canFullEdit || canEditStatus) ? 5 : 4}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-[#1e5a7d] text-sm lg:text-base">{obj.code}</div>
                                <div className="text-xs lg:text-sm text-gray-700 mt-1">{obj.title}</div>
                              </div>
                              {canFullEdit && (
                                <div className="flex gap-1 lg:gap-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setEditingObjective(obj); setDialogOpen(true); }}
                                    className="h-8 w-8 p-0 hover:bg-blue-50"
                                  >
                                    <Pencil className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteObjective(obj.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setSelectedObjectiveId(obj.id); setEditingKR(null); setKrDialogOpen(true); }}
                                    className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-2 text-xs"
                                  >
                                    <Plus className="h-3 w-3 lg:h-4 lg:w-4 lg:mr-1" />
                                    <span className="hidden lg:inline">KR</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Linhas dos KRs */}
                        {objKRs.map((kr, index) => (
                          <tr key={kr.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="p-2 lg:p-4 pl-4 lg:pl-8">
                              <div className="text-xs lg:text-sm">
                                <span className="font-semibold text-gray-800">{kr.code}:</span>{' '}
                                <span className="text-gray-600">{kr.description}</span>
                              </div>
                            </td>
                            <td className="p-2 lg:p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {getStatusBadge(kr.status)}
                                {canEditStatus && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setEditingKRStatus(kr); setStatusDialogOpen(true); }}
                                    className="h-6 w-6 p-0 hover:bg-blue-50"
                                    title="Alterar status"
                                  >
                                    <Pencil className="h-3 w-3 text-blue-600" />
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td className="p-2 lg:p-4 text-center">{getSituationBadge(kr.situation)}</td>
                            <td className="p-2 lg:p-4 text-center text-xs lg:text-sm text-gray-600">{kr.deadline}</td>
                            {canFullEdit && (
                              <td className="p-2 lg:p-4">
                                <div className="flex gap-1 lg:gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setEditingKR(kr); setKrDialogOpen(true); }}
                                    className="h-8 w-8 p-0 hover:bg-blue-50"
                                  >
                                    <Pencil className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteKR(kr.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            )}
                            {!canFullEdit && canEditStatus && (
                              <td className="p-2 lg:p-4"></td>
                            )}
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Objetivo - Apenas ADMIN */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!savingObjective) setDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg" key={`objective-dialog-${editingObjective?.id || 'new'}`}>
          <form onSubmit={handleSaveObjective} key={`objective-form-${editingObjective?.id || 'new'}`}>
            <DialogHeader>
              <DialogTitle>{editingObjective ? 'Editar Objetivo' : 'Novo Objetivo'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do objetivo estratégico
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="code">Código <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  name="code" 
                  defaultValue={editingObjective?.code} 
                  required 
                  disabled={savingObjective}
                  placeholder="Ex: OE01"
                />
              </div>
              <div>
                <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={editingObjective?.title} 
                  required 
                  disabled={savingObjective}
                  placeholder="Ex: Melhorar a eficiência operacional"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingObjective?.description} 
                  disabled={savingObjective}
                  placeholder="Descreva o objetivo estratégico..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={savingObjective}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={savingObjective}>
                {savingObjective ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para KR - Apenas ADMIN */}
      <Dialog open={krDialogOpen} onOpenChange={(open) => {
        if (!savingKR) setKrDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg" key={`kr-dialog-${editingKR?.id || 'new'}-${selectedObjectiveId}`}>
          <form onSubmit={handleSaveKR} key={`kr-form-${editingKR?.id || 'new'}`}>
            <DialogHeader>
              <DialogTitle>{editingKR ? 'Editar KR' : 'Novo KR'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do Key Result
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="objectiveId">Objetivo <span className="text-red-500">*</span></Label>
                <Select name="objectiveId" defaultValue={editingKR?.objectiveId || selectedObjectiveId} required disabled={savingKR}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredObjectives.map(obj => (
                      <SelectItem key={obj.id} value={obj.id}>{obj.code} - {obj.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="code">Código <span className="text-red-500">*</span></Label>
                <Input id="code" name="code" defaultValue={editingKR?.code} required disabled={savingKR} placeholder="Ex: KR01" />
              </div>
              <div>
                <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
                <Textarea id="description" name="description" defaultValue={editingKR?.description} required disabled={savingKR} placeholder="Descreva o Key Result..." />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingKR?.status || 'NAO_INICIADO'} required disabled={savingKR}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO_INICIADO">A iniciar</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="situation">Situação (Calculado Automaticamente)</Label>
                <Select name="situation" defaultValue={editingKR?.situation || 'NO_PRAZO'} disabled>
                  <SelectTrigger className="bg-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO_PRAZO">No prazo</SelectItem>
                    <SelectItem value="EM_ATRASO">Em atraso</SelectItem>
                    <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  A situação é atualizada automaticamente com base no status e no prazo.
                </p>
              </div>
              <div>
                <Label htmlFor="deadline">Prazo <span className="text-red-500">*</span></Label>
                <Input id="deadline" name="deadline" placeholder="Ex: julho - 2025" defaultValue={editingKR?.deadline} required disabled={savingKR} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setKrDialogOpen(false)} disabled={savingKR}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingKR}>
                {savingKR ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para alterar STATUS - GESTOR e ADMIN */}
      <Dialog open={statusDialogOpen} onOpenChange={(open) => {
        if (!savingStatus) setStatusDialogOpen(open);
      }}>
        <DialogContent className="max-w-md" key={`status-dialog-${editingKRStatus?.id || 'none'}`}>
          <form onSubmit={handleSaveKRStatus} key={`status-form-${editingKRStatus?.id || 'none'}`}>
            <DialogHeader>
              <DialogTitle>Alterar Status do KR</DialogTitle>
              <DialogDescription>
                {editingKRStatus && `${editingKRStatus.code}: ${editingKRStatus.description}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="status">Novo Status</Label>
                <Select name="status" defaultValue={editingKRStatus?.status} required disabled={savingStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAO_INICIADO">A iniciar</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={savingStatus}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingStatus}>
                {savingStatus ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}