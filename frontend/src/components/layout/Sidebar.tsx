import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Settings,
  Users,
  FileText,
  Megaphone,
  LayoutDashboard,
  ClipboardList,
  FilePlus,
  RefreshCw,
  Shield,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubMenuItem {
  title: string;
  icon?: LucideIcon;
  path: string;
}

// Tipos de diretoria
type Diretoria = 'SGJT' | 'DPE' | 'DIJUD' | 'DTI' | 'DSTI';

interface MenuItem {
  title: string;
  icon?: LucideIcon;
  path?: string;
  adminOnly?: boolean;
  sgjtOnly?: boolean;
  // Diretorias que podem acessar (se vazio ou undefined, todas podem)
  allowedDiretorias?: Diretoria[];
  children?: SubMenuItem[];
}

// Permissões por diretoria (baseado nas regras definidas)
// SGJT: acesso a tudo
// DPE/DIJUD: SEM contratações
// DTI/DSTI: COM contratações
const PERMISSOES_CONTRATACOES: Diretoria[] = ['SGJT', 'DTI', 'DSTI'];

// Menu com sub-itens expansíveis
const menuItems: MenuItem[] = [
  {
    title: 'Gestão Estratégica',
    icon: Target,
    children: [
      { title: 'Visão Geral', icon: LayoutDashboard, path: '/gestao-estrategica' },
      { title: 'Monitoramento de OKRs', icon: Target, path: '/gestao-estrategica/okrs' },
      { title: 'Controle de Execução', icon: ClipboardList, path: '/gestao-estrategica/execucao' },
      { title: 'Sprint Atual', icon: RefreshCw, path: '/gestao-estrategica/sprint' },
    ]
  },
  {
    title: 'Contratações de TI',
    icon: FileText,
    allowedDiretorias: PERMISSOES_CONTRATACOES, // Apenas SGJT, DTI e DSTI
    children: [
      { title: 'Novas Contratações', icon: FilePlus, path: '/contratacoes-ti/novas' },
      { title: 'Renovações', icon: RefreshCw, path: '/contratacoes-ti/renovacoes' },
    ]
  },
  {
    title: 'Comitês',
    icon: Megaphone,
    path: '/comites'
  },
  {
    title: 'Pessoas',
    icon: Users,
    children: [
      { title: 'Painel', icon: LayoutDashboard, path: '/pessoas/painel' },
      { title: 'Formulários', icon: ClipboardList, path: '/pessoas/formularios' },
    ]
  },
  {
    title: 'Administração',
    icon: Settings,
    path: '/administracao',
    adminOnly: true
  },
  {
    title: 'SGJT',
    icon: Shield,
    path: '/sgjt',
    adminOnly: true,
    sgjtOnly: true
  }
];

interface MenuItemComponentProps {
  item: MenuItem;
  onNavigate?: () => void;
  isMinimized?: boolean;
  expandedMenus: string[];
  toggleMenu: (title: string) => void;
}

function MenuItemComponent({ 
  item, 
  onNavigate, 
  isMinimized = false,
  expandedMenus,
  toggleMenu
}: MenuItemComponentProps) {
  const location = useLocation();
  const { user } = useAuth();

  if (item.adminOnly && user?.role !== 'ADMIN') {
    return null;
  }
  
  // Verificar se é exclusivo para SGJT
  // Se não tem diretoria definida e é ADMIN, assume SGJT (fallback)
  const userDiretoria = (user as any)?.diretoria || (user?.role === 'ADMIN' ? 'SGJT' : null);
  if (item.sgjtOnly && userDiretoria !== 'SGJT') {
    return null;
  }

  // Verificar permissões por diretoria
  // Se allowedDiretorias está definido, verificar se a diretoria do usuário está na lista
  if (item.allowedDiretorias && item.allowedDiretorias.length > 0) {
    if (!userDiretoria || !item.allowedDiretorias.includes(userDiretoria as Diretoria)) {
      return null;
    }
  }

  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedMenus.includes(item.title);
  
  // Verifica se algum filho está ativo (verificação exata)
  const isChildActive = hasChildren && item.children?.some(
    child => location.pathname === child.path
  );
  
  const isActive = item.path === location.pathname || isChildActive;

  // Se tem filhos, renderiza menu expansível
  if (hasChildren) {
    const menuContent = (
      <div>
        {/* Botão do menu pai */}
        <button
          onClick={() => toggleMenu(item.title)}
          className={cn(
            'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors',
            isActive && 'bg-white/10 text-white',
            isMinimized && 'justify-center'
          )}
        >
          {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
          {!isMinimized && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} 
              />
            </>
          )}
        </button>

        {/* Sub-itens */}
        {!isMinimized && isExpanded && (
          <div className="bg-black/20">
            {item.children?.map((child, idx) => {
              // Verificação exata - apenas igualdade de pathname
              const isSubActive = location.pathname === child.path;
              return (
                <Link
                  key={idx}
                  to={child.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2 pl-10 pr-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors',
                    isSubActive && 'bg-white/15 text-white border-l-2 border-white ml-2'
                  )}
                >
                  {child.icon && <child.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                  <span>{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );

    if (isMinimized && item.icon) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleMenu(item.title)}
                className={cn(
                  'w-full flex items-center justify-center px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors',
                  isActive && 'bg-white/10 text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-0">
              <div className="bg-[#002547] rounded-md shadow-lg border border-white/20 min-w-[180px]">
                <div className="px-3 py-2 border-b border-white/10 font-medium text-white text-sm">
                  {item.title}
                </div>
                {item.children?.map((child, idx) => {
                  const isSubActive = location.pathname === child.path;
                  return (
                    <Link
                      key={idx}
                      to={child.path}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors',
                        isSubActive && 'bg-white/15 text-white'
                      )}
                    >
                      {child.icon && <child.icon className="h-3.5 w-3.5" />}
                      <span>{child.title}</span>
                    </Link>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return menuContent;
  }

  // Se não tem filhos, renderiza link simples
  const content = (
    <Link
      to={item.path || '#'}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors',
        isActive && 'bg-white/20 text-white border-r-4 border-white',
        isMinimized && 'justify-center'
      )}
    >
      {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
      {!isMinimized && <span>{item.title}</span>}
    </Link>
  );

  if (isMinimized && item.icon) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('sidebar-minimized');
    return saved === 'true';
  });

  // Estado para menus expandidos
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // Expandir automaticamente o menu que contém a rota atual
    const currentPath = location.pathname;
    const expanded: string[] = [];
    
    menuItems.forEach(item => {
      if (item.children?.some(child => 
        currentPath === child.path || currentPath.startsWith(child.path + '/')
      )) {
        expanded.push(item.title);
      }
    });
    
    return expanded;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-minimized', String(isMinimized));
  }, [isMinimized]);

  // Expandir menu quando navegar para uma rota filha
  useEffect(() => {
    const currentPath = location.pathname;
    
    menuItems.forEach(item => {
      if (item.children?.some(child => 
        currentPath === child.path || currentPath.startsWith(child.path + '/')
      )) {
        if (!expandedMenus.includes(item.title)) {
          setExpandedMenus(prev => [...prev, item.title]);
        }
      }
    });
  }, [location.pathname]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky left-0 z-50 h-screen overflow-y-auto transition-all duration-300 ease-in-out',
          'lg:top-[73px] lg:h-[calc(100vh-73px)]',
          'top-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isMinimized ? 'w-16' : 'w-64'
        )}
        style={{
          backgroundColor: '#002547'
        }}
      >
        {/* Header do Sidebar */}
        <div
          className="sticky top-0 z-10"
          style={{
            backgroundColor: '#002547',
            borderBottomColor: '#ffffff40',
            borderBottomWidth: '1px'
          }}
        >
          <div className="flex items-center justify-between p-3">
            {/* Botão Minimizar (Desktop) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              className="hidden lg:flex text-white hover:bg-white/10"
              title={isMinimized ? 'Expandir menu' : 'Minimizar menu'}
            >
              {isMinimized ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="text-xs">Minimizar</span>
                </>
              )}
            </Button>

            {/* Botão Fechar (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden ml-auto text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="py-2">
          {menuItems.map((item, index) => (
            <MenuItemComponent 
              key={index} 
              item={item} 
              onNavigate={onClose} 
              isMinimized={isMinimized}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
