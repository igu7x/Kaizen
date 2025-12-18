import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Shield, Check, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
    permissoesApi, 
    TodasPermissoes, 
    Diretoria, 
    DIRETORIAS, 
    DIRETORIAS_LABELS 
} from '@/services/permissoesApi';

export default function SGJT() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [dados, setDados] = useState<TodasPermissoes | null>(null);
    const [permissoesEditadas, setPermissoesEditadas] = useState<Record<string, Record<string, {
        pode_acessar: boolean;
        apenas_propria_diretoria: boolean;
    }>>>({});

    // Verificar se usuário é SGJT (fallback para ADMIN se não tem diretoria definida)
    const userDiretoria = (user as any)?.diretoria || (user?.role === 'ADMIN' ? 'SGJT' : null);
    const isSGJT = userDiretoria === 'SGJT';

    useEffect(() => {
        carregarPermissoes();
    }, []);

    const carregarPermissoes = async () => {
        try {
            setLoading(true);
            const data = await permissoesApi.getTodasPermissoes();
            setDados(data);
            
            // Inicializar estado de edição
            const inicial: Record<string, Record<string, any>> = {};
            data.permissoes_por_diretoria.forEach(({ diretoria, permissoes }) => {
                inicial[diretoria] = {};
                permissoes.forEach(p => {
                    inicial[diretoria][p.aba_codigo] = {
                        pode_acessar: p.pode_acessar,
                        apenas_propria_diretoria: p.apenas_propria_diretoria
                    };
                });
            });
            setPermissoesEditadas(inicial);
        } catch (error: any) {
            console.error('Erro ao carregar permissões:', error);
            // Não mostrar toast de erro para não confundir - as tabelas podem não existir ainda
            // Mostrar dados mockados para teste
            setDados({
                abas: [
                    { codigo: 'dashboard', nome: 'Dashboard', descricao: 'Painel inicial', icone: 'LayoutDashboard', ordem: 1, ativo: true },
                    { codigo: 'gestao_estrategica', nome: 'Gestão Estratégica', descricao: 'OKRs e monitoramento', icone: 'Target', ordem: 2, ativo: true },
                    { codigo: 'contratacoes', nome: 'Contratações de TI', descricao: 'PCA e contratações', icone: 'FileText', ordem: 3, ativo: true },
                    { codigo: 'comites', nome: 'Comitês', descricao: 'Gestão de comitês', icone: 'Users', ordem: 4, ativo: true },
                    { codigo: 'pessoas', nome: 'Pessoas', descricao: 'Colaboradores e organograma', icone: 'UserCircle', ordem: 5, ativo: true },
                    { codigo: 'formularios', nome: 'Formulários', descricao: 'Formulários dinâmicos', icone: 'ClipboardList', ordem: 6, ativo: true },
                    { codigo: 'administracao', nome: 'Administração', descricao: 'Gestão de usuários', icone: 'Settings', ordem: 7, ativo: true },
                ],
                permissoes_por_diretoria: []
            });
            toast.warning('Execute a migration 032 no banco para habilitar o gerenciamento de permissões.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAcesso = (diretoria: Diretoria, abaCodigo: string) => {
        if (diretoria === 'SGJT') return; // Não pode alterar SGJT
        
        setPermissoesEditadas(prev => ({
            ...prev,
            [diretoria]: {
                ...prev[diretoria],
                [abaCodigo]: {
                    ...prev[diretoria]?.[abaCodigo],
                    pode_acessar: !prev[diretoria]?.[abaCodigo]?.pode_acessar
                }
            }
        }));
    };

    const handleToggleApenasPropria = (diretoria: Diretoria, abaCodigo: string) => {
        if (diretoria === 'SGJT') return; // Não pode alterar SGJT
        
        setPermissoesEditadas(prev => ({
            ...prev,
            [diretoria]: {
                ...prev[diretoria],
                [abaCodigo]: {
                    ...prev[diretoria]?.[abaCodigo],
                    apenas_propria_diretoria: !prev[diretoria]?.[abaCodigo]?.apenas_propria_diretoria
                }
            }
        }));
    };

    const salvarPermissoes = async (diretoria: Diretoria) => {
        if (diretoria === 'SGJT') {
            toast.error('Não é possível alterar permissões da SGJT');
            return;
        }

        try {
            setSaving(diretoria);
            
            const permissoes = Object.entries(permissoesEditadas[diretoria] || {}).map(([aba_codigo, valores]) => ({
                aba_codigo,
                pode_acessar: valores.pode_acessar,
                apenas_propria_diretoria: valores.apenas_propria_diretoria
            }));

            await permissoesApi.atualizarPermissoesDiretoria(diretoria, permissoes);
            toast.success(`Permissões de ${diretoria} atualizadas com sucesso!`);
            
            // Recarregar para confirmar
            await carregarPermissoes();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            toast.error(error.message || 'Erro ao salvar permissões');
        } finally {
            setSaving(null);
        }
    };

    if (!isSGJT) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Card className="max-w-md">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <AlertTriangle className="w-16 h-16 text-yellow-500" />
                                <h2 className="text-xl font-bold">Acesso Restrito</h2>
                                <p className="text-muted-foreground">
                                    Esta página é exclusiva para usuários da SGJT.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Painel SGJT</h1>
                    <p className="text-white/80">Gerenciar permissões de acesso por diretoria</p>
                </div>
            </div>

            {/* Tabs por Diretoria */}
            <Tabs defaultValue="DPE" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 mb-6">
                    {DIRETORIAS.filter(d => d !== 'SGJT').map(dir => (
                        <TabsTrigger key={dir} value={dir} className="text-sm">
                            {dir}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {DIRETORIAS.filter(d => d !== 'SGJT').map(diretoria => (
                    <TabsContent key={diretoria} value={diretoria}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-lg px-3 py-1">
                                                {diretoria}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            {DIRETORIAS_LABELS[diretoria]}
                                        </CardDescription>
                                    </div>
                                    <Button 
                                        onClick={() => salvarPermissoes(diretoria)}
                                        disabled={saving === diretoria}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {saving === diretoria ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            'Salvar Alterações'
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold">Aba/Módulo</th>
                                                <th className="text-center py-3 px-4 font-semibold">Pode Acessar</th>
                                                <th className="text-center py-3 px-4 font-semibold">Apenas Própria Diretoria</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dados?.abas.filter(a => a.codigo !== 'sgjt').map(aba => {
                                                const perm = permissoesEditadas[diretoria]?.[aba.codigo];
                                                return (
                                                    <tr key={aba.codigo} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{aba.nome}</span>
                                                                {aba.descricao && (
                                                                    <span className="text-sm text-gray-500">{aba.descricao}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <div className="flex justify-center">
                                                                <Checkbox
                                                                    checked={perm?.pode_acessar ?? false}
                                                                    onCheckedChange={() => handleToggleAcesso(diretoria, aba.codigo)}
                                                                    className="h-5 w-5"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <div className="flex justify-center">
                                                                <Checkbox
                                                                    checked={perm?.apenas_propria_diretoria ?? true}
                                                                    onCheckedChange={() => handleToggleApenasPropria(diretoria, aba.codigo)}
                                                                    disabled={!perm?.pode_acessar}
                                                                    className="h-5 w-5"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Legenda */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Legenda:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span><strong>Pode Acessar:</strong> Se marcado, usuários da diretoria podem ver esta aba</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span><strong>Apenas Própria Diretoria:</strong> Se marcado, usuários só veem dados da própria diretoria</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
        </Layout>
    );
}

