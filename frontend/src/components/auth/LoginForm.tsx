import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação básica
    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!password) {
      setError('Por favor, informe sua senha.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Usar mensagem de erro do contexto
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0A2547 0%, #1565C0 100%)' }}
    >
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-6 text-center pb-2">
          {/* Header Institucional */}
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <img 
              src="/brasao-goias.png" 
              alt="Brasão de Goiás" 
              className="h-20 w-auto object-contain" 
            />
            <div className="text-left flex-1">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong className="text-gray-900">PODER JUDICIÁRIO</strong><br />
                Tribunal de Justiça do Estado de Goiás<br />
                <span className="text-gray-500 text-[10px]">
                  Diretoria de Soluções em Tecnologia da Informação<br />
                  Coordenadoria de Transformação Digital
                </span>
              </p>
              <p className="text-sm font-semibold text-blue-700 mt-2 leading-tight">
                Secretaria de Governança<br />
                Judiciária e Tecnológica
              </p>
            </div>
          </div>

          {/* Título Kaizen */}
          <div className="pt-2">
            <CardTitle 
              className="text-4xl font-bold tracking-wide"
              style={{ 
                color: '#0A2547',
                fontFamily: "'Segoe UI', 'Roboto', sans-serif"
              }}
            >
              Kaizen
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-1">
              Plataforma de Governança Judiciária e Tecnológica
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@tjgo.jus.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" 
              style={{ 
                backgroundColor: '#0A2547',
                color: '#FFFFFF'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-1">
            <p className="text-sm text-gray-500">Problemas para acessar?</p>
            <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">
              Entre em contato com o suporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
