import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-[60] px-4 lg:px-6 py-3 flex items-center justify-between relative"
      style={{
        background: 'linear-gradient(135deg, #0A2547 0%, #1565C0 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Botão Menu Mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-white hover:bg-white/10"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo - Brasão de Goiás */}
        <img
          src="/brasao-goias.png"
          alt="Brasão de Goiás"
          className="h-14 w-auto object-contain"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        />

        <div className="hidden md:block border-l h-14 mx-1" style={{ borderColor: 'rgba(255,255,255,0.3)' }}></div>

        {/* Título e Subtítulo - Estilo Kaizen */}
        <div className="flex flex-col gap-0.5">
          <h1 
            className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-wide"
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              fontFamily: "'Segoe UI', 'Roboto', sans-serif"
            }}
          >
            Kaizen
          </h1>
          <p 
            className="text-xs md:text-sm text-white/90 leading-tight hidden sm:block"
            style={{ fontFamily: "'Segoe UI', 'Roboto', sans-serif" }}
          >
            Plataforma de Governança Judiciária e Tecnológica
          </p>
        </div>
      </div>

      {/* Crédito do Desenvolvedor - Centro Absoluto */}
      <div 
        className="hidden md:flex flex-col items-center justify-center absolute left-1/2 top-1/2"
        style={{ transform: 'translate(0%, -50%)' }}
      >
        <span 
          className="text-white/70 text-xs tracking-widest uppercase"
          style={{ 
            fontFamily: "'Poppins', 'Montserrat', sans-serif",
            letterSpacing: '0.2em'
          }}
        >
          Developed by
        </span>
        <span 
          className="text-white font-semibold text-sm md:text-base"
          style={{ 
            fontFamily: "'Poppins', 'Montserrat', sans-serif",
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            background: 'linear-gradient(90deg, #fff 0%, #90CAF9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Igor Cupertino
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>{user?.email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <span className="text-xs text-muted-foreground">
              Perfil: {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'MANAGER' ? 'Gestor' : 'Visualizador'}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}