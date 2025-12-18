import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, UserCheck, UserX, Eye, EyeOff, Search, X } from 'lucide-react';
import { api } from '@/services/api';
import { User, UserRole } from '@/types';
import { DIRETORIAS, DIRETORIAS_LABELS, Diretoria } from '@/services/permissoesApi';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export default function Administracao() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar usuários pelo nome (busca local, sem chamar API)
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: any = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      status: (formData.get('status') as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      diretoria: (formData.get('diretoria') as Diretoria) || 'SGJT'
    };

    // Adicionar senha se foi preenchida
    if (password) {
      data.password = password;
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, data);
      } else {
        await api.createUser(data);
      }
      await loadUsers();
      setDialogOpen(false);
      setEditingUser(null);
      setPassword('');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.updateUser(user.id, { status: newStatus });
      await loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  const generateRandomPassword = () => {
    // Gerar senha de 10 dígitos numéricos
    const newPassword = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    setPassword(newPassword);
    setShowPassword(true); // Mostrar a senha gerada para o admin ver
  };

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, BadgeVariant> = {
      ADMIN: 'destructive',
      MANAGER: 'default',
      VIEWER: 'secondary'
    };
    const labels = {
      ADMIN: 'Administrador',
      MANAGER: 'Gestor',
      VIEWER: 'Visualizador'
    };
    return <Badge variant={variants[role]}>{labels[role]}</Badge>;
  };

  const getStatusBadge = (status: 'ACTIVE' | 'INACTIVE') => {
    return status === 'ACTIVE' ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inativo</Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div>Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Administração de Usuários</h1>
            <p className="text-white/80 mt-2">
              Gerencie usuários e permissões da plataforma
            </p>
          </div>
          <Button onClick={() => { setEditingUser(null); setPassword(''); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Usuários Cadastrados</CardTitle>
              {/* Campo de Busca */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Contagem de resultados */}
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                {searchTerm && <> para "<strong>{searchTerm}</strong>"</>}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nome</th>
                    <th className="text-left p-4">E-mail</th>
                    <th className="text-left p-4">Diretoria</th>
                    <th className="text-left p-4">Perfil</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {searchTerm ? (
                          <>
                            Nenhum usuário encontrado para "{searchTerm}"
                            <button 
                              onClick={() => setSearchTerm('')}
                              className="ml-2 text-blue-600 hover:underline"
                            >
                              Limpar busca
                            </button>
                          </>
                        ) : (
                          'Nenhum usuário cadastrado'
                        )}
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-medium">
                          {(user as any).diretoria || 'SGJT'}
                        </Badge>
                      </td>
                      <td className="p-4">{getRoleBadge(user.role)}</td>
                      <td className="p-4">{getStatusBadge(user.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingUser(user); setPassword(''); setDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.status === 'ACTIVE' ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para Usuário */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSaveUser}>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do usuário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" defaultValue={editingUser?.name} required />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingUser?.email} required />
                </div>

                {/* Campo de Senha */}
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={editingUser ? "Deixe em branco para manter" : "Senha do usuário"}
                        required={!editingUser}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomPassword}
                      className="whitespace-nowrap"
                    >
                      Gerar senha aleatória
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Perfil</Label>
                  <Select name="role" defaultValue={editingUser?.role || 'VIEWER'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Visualizador</SelectItem>
                      <SelectItem value="MANAGER">Gestor</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="diretoria">Diretoria</Label>
                  <Select name="diretoria" defaultValue={(editingUser as any)?.diretoria || 'SGJT'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIRETORIAS.map(dir => (
                        <SelectItem key={dir} value={dir}>
                          {dir} - {DIRETORIAS_LABELS[dir]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingUser?.status || 'ACTIVE'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="INACTIVE">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
