import { useState } from 'react';
import { useBarberAuth } from '@/hooks/useBarberAuth';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const BarberLogin = () => {
  const { login, loading: authLoading } = useBarberAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    } else {
      // Login bem-sucedido - a página será recarregada pela proteção de rota
      window.location.href = '/admin';
    }

    setLoading(false);
  };

  const isLoading = loading || authLoading;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background-login.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay desfocado escuro */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      
      {/* Conteúdo */}
      <div className="relative z-10">
        <Card className="w-full max-w-md bg-black/40 border-white/20 backdrop-blur-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mx-auto">
            <img src="/logo.jpeg" alt="Logo Barbershop" className="h-16 w-16 rounded-full object-cover" />
          </div>
          <CardTitle className="text-center">Barbershop Do Gui</CardTitle>
          <CardDescription className="text-center">
            Painel do Barbeiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Input
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
