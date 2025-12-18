import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { PainelColaboradores } from '@/components/pessoas/PainelColaboradores';
import { AdminFormsView } from '@/components/pessoas/AdminFormsView';
import { UserFormsView } from '@/components/pessoas/UserFormsView';

export default function Pessoas() {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';

  // Determinar qual componente renderizar baseado na rota
  const isFormularios = location.pathname.includes('/formularios');

  return (
    <Layout>
      {isFormularios ? (
        isAdmin ? <AdminFormsView /> : <UserFormsView />
      ) : (
        <PainelColaboradores />
      )}
    </Layout>
  );
}
