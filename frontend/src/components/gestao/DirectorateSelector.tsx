import { useEffect } from 'react';
import { useDirectorate } from '@/contexts/DirectorateContext';
import { useAuth } from '@/contexts/AuthContext';
import { DIRECTORATES, Directorate } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function DirectorateSelector() {
  const { selectedDirectorate, setSelectedDirectorate } = useDirectorate();
  const { user } = useAuth();
  
  // Pegar diretoria do usuário
  // Fallback: se não tem diretoria definida e é ADMIN, assume SGJT
  const userDiretoria = (user as any)?.diretoria || (user?.role === 'ADMIN' ? 'SGJT' : undefined) as Directorate | undefined;
  const isSGJT = userDiretoria === 'SGJT';
  
  // Filtrar diretorias disponíveis
  // SGJT pode ver todas, outros só a própria
  const diretoriasDisponiveis = isSGJT 
    ? DIRECTORATES 
    : userDiretoria 
      ? DIRECTORATES.filter(d => d.value === userDiretoria)
      : DIRECTORATES; // Se não tem diretoria, mostra todas (fallback)
  
  // Forçar seleção da própria diretoria se não for SGJT
  useEffect(() => {
    if (!isSGJT && userDiretoria && selectedDirectorate !== userDiretoria) {
      setSelectedDirectorate(userDiretoria);
    }
  }, [isSGJT, userDiretoria, selectedDirectorate, setSelectedDirectorate]);

  // Se só tem uma opção, não precisa mostrar o seletor
  if (diretoriasDisponiveis.length <= 1) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <Label className="text-sm font-medium whitespace-nowrap">
          Diretoria:
        </Label>
        <span className="font-semibold text-blue-700">
          {userDiretoria || 'SGJT'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <Label htmlFor="directorate" className="text-sm font-medium whitespace-nowrap">
        Diretoria:
      </Label>
      <Select value={selectedDirectorate} onValueChange={setSelectedDirectorate}>
        <SelectTrigger id="directorate" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {diretoriasDisponiveis.map((dir) => (
            <SelectItem key={dir.value} value={dir.value}>
              {dir.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}