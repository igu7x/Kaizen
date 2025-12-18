/**
 * Página de Seleção de Comitês
 * Exibe os 8 comitês disponíveis para seleção
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { comitesApi } from '@/services/comitesApi';
import type { Comite } from '@/types';
import { 
    Megaphone, 
    Users, 
    Shield, 
    ShieldCheck, 
    Workflow, 
    AlertTriangle, 
    Lightbulb, 
    Scale,
    ChevronRight
} from 'lucide-react';

// Mapeamento de ícones
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'megafone': Megaphone,
    'pessoas': Users,
    'pessoa-escudo': ShieldCheck,
    'escudo': Shield,
    'diagrama': Workflow,
    'relogio-alerta': AlertTriangle,
    'lampada': Lightbulb,
    'balanca': Scale
};

export default function Comites() {
    const navigate = useNavigate();
    const [comites, setComites] = useState<Comite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadComites();
    }, []);

    const loadComites = async () => {
        try {
            setLoading(true);
            const data = await comitesApi.getAll();
            setComites(data);
            setError(null);
        } catch (err: any) {
            console.error('Erro ao carregar comitês:', err);
            setError('Erro ao carregar comitês. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleComiteClick = (comite: Comite) => {
        navigate(`/comites/${comite.sigla.toLowerCase()}`);
    };

    const getIcon = (icone: string | null) => {
        if (!icone) return Megaphone;
        return iconMap[icone] || Megaphone;
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#002547]">
                {/* Conteúdo */}
                <div className="max-w-6xl mx-auto px-6 py-10">
                    <h2 className="text-2xl font-semibold text-white mb-8 text-center">
                        Selecione o Comitê
                    </h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <Skeleton key={i} className="h-36 rounded-xl bg-white/10" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {comites.map((comite) => {
                                const Icon = getIcon(comite.icone);
                                return (
                                    <Card
                                        key={comite.id}
                                        onClick={() => handleComiteClick(comite)}
                                        className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0"
                                        style={{ backgroundColor: comite.cor || '#1565C0' }}
                                    >
                                        <div className="p-6 flex items-center gap-5 text-white">
                                            <div className="flex-shrink-0 bg-white/20 rounded-xl p-4 group-hover:bg-white/30 transition-colors">
                                                <Icon className="h-10 w-10" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">
                                                    {comite.nome}
                                                </h3>
                                                <span className="inline-flex items-center gap-1 text-sm text-white/80 bg-white/10 px-2 py-0.5 rounded">
                                                    {comite.sigla}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-6 w-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

