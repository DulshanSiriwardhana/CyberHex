import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useWebSocket } from '@/hooks/useWebSocket';

interface LossData {
  epoch: number;
  loss: number;
}

const CyberGames = () => {
  const [lossData, setLossData] = useState<LossData[]>([]);

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'loss_update') {
      setLossData(prev => [...prev, { epoch: data.epoch, loss: data.loss }]);
    }
  };

  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const websocketUrl = `${wsProtocol}://${window.location.host}/ws`;
  useWebSocket(websocketUrl, handleWebSocketMessage);

  return (
    <div>
      <h1>Cyber Games</h1>
      <LineChart width={600} height={300} data={lossData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="epoch" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="loss" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default CyberGames;