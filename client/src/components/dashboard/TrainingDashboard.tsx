import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { Activity, Zap } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

export const TrainingDashboard = () => {
    const [data, setData] = useState<any[]>([]);

    const handleMessage = useCallback((msg: any) => {
        setData(prev => [...prev.slice(-19), msg]);
    }, []);

    useWebSocket(`ws://${window.location.hostname}:8081`, handleMessage);

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
                <Card className="h-[400px]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="text-emerald-500" />Real-time Loss</h2>
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="epoch" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222' }} />
                            <Line type="monotone" dataKey="loss" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <Card>
                    <div className="text-zinc-500 text-sm uppercase tracking-wider mb-2">Current Epoch</div>
                    <div className="text-4xl font-bold">{data.length > 0 ? data[data.length - 1].epoch : '...'}</div>
                </Card>
                <Card>
                    <div className="text-zinc-500 text-sm uppercase tracking-wider mb-2">System Status</div>
                    <div className="text-emerald-500 font-medium flex items-center gap-2"><Zap size={16} /> Online</div>
                </Card>
            </div>
        </div>
    );
};
