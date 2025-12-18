import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GraficoBarrasProps {
  title: string;
  data: Record<string, string | number>[];
  dataKeys: { key: string; name: string; color: string }[];
  xAxisKey: string;
}

export function GraficoBarras({ title, data, dataKeys, xAxisKey }: GraficoBarrasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((dk) => (
              <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}