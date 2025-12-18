import { createContext, useContext, ReactNode } from 'react';
import { Directorate } from '@/types';
import { useLocalStorage } from '@/utils/storage';

interface DirectorateContextType {
  selectedDirectorate: Directorate;
  setSelectedDirectorate: (directorate: Directorate) => void;
}

const DirectorateContext = createContext<DirectorateContextType | undefined>(undefined);

export function DirectorateProvider({ children }: { children: ReactNode }) {
  // Usa useLocalStorage para persistir a diretoria selecionada
  const [selectedDirectorate, setSelectedDirectorate] = useLocalStorage<Directorate>('selectedDirectorate', 'SGJT');

  return (
    <DirectorateContext.Provider value={{ selectedDirectorate, setSelectedDirectorate }}>
      {children}
    </DirectorateContext.Provider>
  );
}

export function useDirectorate() {
  const context = useContext(DirectorateContext);
  if (!context) {
    throw new Error('useDirectorate must be used within DirectorateProvider');
  }
  return context;
}