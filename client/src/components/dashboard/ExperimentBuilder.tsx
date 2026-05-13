import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/master-components';

export const ExperimentBuilder = () => {
    const [modelName, setModelName] = useState('');
    const [layers, setLayers] = useState([{ units: 32, activation: 'ReLU' }]);

    const addLayer = () => setLayers([...layers, { units: 32, activation: 'ReLU' }]);

    const startTraining = () => {
        // Send request to backend to create and train
        fetch('/api/v1/experiments', {
            method: 'POST',
            body: JSON.stringify({ name: modelName, layers }),
            headers: { 'Content-Type': 'application/json' }
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">New Experiment</h1>
            <Card>
                <div className="space-y-4">
                    <input 
                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white"
                        placeholder="Experiment Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                    />
                    <div className="space-y-2">
                        {layers.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="number" className="bg-black border border-zinc-700 p-2 rounded w-20" value={l.units} onChange={(e) => {
                                    const next = [...layers];
                                    next[i].units = parseInt(e.target.value);
                                    setLayers(next);
                                }} />
                                <select className="bg-black border border-zinc-700 p-2 rounded" value={l.activation} onChange={(e) => {
                                    const next = [...layers];
                                    next[i].activation = e.target.value;
                                    setLayers(next);
                                }}>
                                    <option>ReLU</option>
                                    <option>Sigmoid</option>
                                    <option>Tanh</option>
                                </select>
                            </div>
                        ))}
                    </div>
                    <Button onClick={addLayer} variant="ghost">+ Add Layer</Button>
                    <Button onClick={startTraining} className="w-full bg-emerald-600">Initiate Training Run</Button>
                </div>
            </Card>
        </div>
    );
};
