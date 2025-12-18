import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GestaoProvider } from './contexts/GestaoContext';
import { DirectorateProvider } from './contexts/DirectorateContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import GestaoEstrategica from './pages/GestaoEstrategica';
import Contratacoes from './pages/Contratacoes';
import PcaItemDetailsPage from './pages/PcaItemDetailsPage';
import RenovacaoDetailsPage from './pages/RenovacaoDetailsPage';
import Administracao from './pages/Administracao';
import Pessoas from './pages/Pessoas';
import Placeholder from './pages/Placeholder';
import Comites from './pages/Comites';
import ComiteMonitoramento from './pages/ComiteMonitoramento';
import SGJT from './pages/SGJT';
import { FormBuilder } from './components/pessoas/FormBuilder';
import { FormFiller } from './components/pessoas/FormFiller';
import { FormResponses } from './components/pessoas/FormResponses';

function App() {
  return (
    <AuthProvider>
      <DirectorateProvider>
        <GestaoProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/gestao-estrategica" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestao-estrategica"
                element={
                  <ProtectedRoute>
                    <GestaoEstrategica />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestao-estrategica/okrs"
                element={
                  <ProtectedRoute>
                    <GestaoEstrategica />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestao-estrategica/execucao"
                element={
                  <ProtectedRoute>
                    <GestaoEstrategica />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestao-estrategica/sprint"
                element={
                  <ProtectedRoute>
                    <GestaoEstrategica />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contratacoes-ti"
                element={
                  <ProtectedRoute>
                    <Navigate to="/contratacoes-ti/novas" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contratacoes-ti/novas"
                element={
                  <ProtectedRoute>
                    <Contratacoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contratacoes-ti/renovacoes"
                element={
                  <ProtectedRoute>
                    <Contratacoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contratacoes-ti/item/:id"
                element={
                  <ProtectedRoute>
                    <PcaItemDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contratacoes-ti/renovacoes/item/:id"
                element={
                  <ProtectedRoute>
                    <RenovacaoDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/administracao"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Administracao />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sgjt"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <SGJT />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas"
                element={
                  <ProtectedRoute>
                    <Navigate to="/pessoas/painel" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas/painel"
                element={
                  <ProtectedRoute>
                    <Pessoas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas/formularios"
                element={
                  <ProtectedRoute>
                    <Pessoas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas/criar"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FormBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas/editar/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FormBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas/responder/:id"
                element={
                  <ProtectedRoute>
                    <FormFiller />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pessoas/respostas/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FormResponses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comites"
                element={
                  <ProtectedRoute>
                    <Comites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comites/:sigla"
                element={
                  <ProtectedRoute>
                    <ComiteMonitoramento />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comites/:sigla/reuniao/:reuniaoId"
                element={
                  <ProtectedRoute>
                    <ComiteMonitoramento />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contratos-tic"
                element={
                  <ProtectedRoute>
                    <Placeholder title="Contratos TIC" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proad-acervo"
                element={
                  <ProtectedRoute>
                    <Placeholder title="PROAD - Acervo" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeira/*"
                element={
                  <ProtectedRoute>
                    <Placeholder title="Diretoria Financeira" />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </GestaoProvider>
      </DirectorateProvider>
    </AuthProvider>
  );
}

export default App;