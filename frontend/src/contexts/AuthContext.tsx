import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { api } from '@/services/api';
import Storage from '@/utils/storage';
import { ApiError, AuthError, NetworkError } from '@/services/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário e token salvos
    const savedUser = Storage.load<User | null>('user', null);
    const token = localStorage.getItem('auth_token');
    
    // Se tiver usuário salvo (com ou sem token por enquanto)
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const loggedUser = await api.login(email, password);
      
      if (!loggedUser) {
        throw new Error('Credenciais inválidas');
      }

      setUser(loggedUser);
      Storage.save('user', loggedUser);
    } catch (error) {
      // Propagar erro com mensagem apropriada
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error('E-mail ou senha incorretos.');
        }
        throw new Error(error.message);
      }
      
      if (error instanceof NetworkError) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }

      if (error instanceof AuthError) {
        throw new Error(error.message);
      }

      // Erro genérico
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      console.warn('Erro no logout:', error);
    } finally {
      setUser(null);
      Storage.remove('user');
      
      // Limpar cache de dados
      Storage.remove('gestao_objectives');
      Storage.remove('gestao_keyResults');
      Storage.remove('gestao_initiatives');
      Storage.remove('gestao_programs');
      Storage.remove('gestao_programInitiatives');
      Storage.remove('gestao_executionControls');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
