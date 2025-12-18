import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardIndicadorProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'teal' | 'green' | 'yellow' | 'orange' | 'gray';
}

// Cores atualizadas conforme especificação
const colorClasses = {
  teal: 'bg-[#2d6a7f]', // Cor de referência (azul-petróleo)
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-400', // Laranja mais discreto
  gray: 'bg-gray-400'
};

const iconBgClasses = {
  teal: 'bg-[#2d6a7f]/30',
  green: 'bg-green-400/30',
  yellow: 'bg-yellow-300/30',
  orange: 'bg-orange-300/30',
  gray: 'bg-gray-300/30'
};

export function CardIndicador({ title, value, icon: Icon, color }: CardIndicadorProps) {
  return (
    <Card className={cn('border-0 shadow-md rounded-lg', colorClasses[color])}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="text-3xl lg:text-4xl font-bold mb-1 lg:mb-2">{value}</div>
            <div className="text-xs lg:text-sm font-medium opacity-90">{title}</div>
          </div>
          <div className={cn('p-3 lg:p-4 rounded-full', iconBgClasses[color])}>
            <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}