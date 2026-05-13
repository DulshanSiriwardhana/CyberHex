import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';

export interface TrainingDataPoint {
    epoch: number;
    loss: number;
    accuracy?: number;
    timestamp?: string;
    validationLoss?: number;
    metrics?: Record<string, number>;
}

interface TrainingChartProps {
    data: TrainingDataPoint[];
    title?: string;
    showLoss?: boolean;
    showAccuracy?: boolean;
    showValidation?: boolean;
    height?: number;
    isLoading?: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                <p className="font-semibold text-gray-800">
                    {`Epoch: ${payload[0].payload.epoch}`}
                </p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const TrainingChart: React.FC<TrainingChartProps> = ({
    data,
    title = 'Training Progress',
    showLoss = true,
    showAccuracy = true,
    showValidation = false,
    height = 400,
    isLoading = false
}) => {
    const chartData = useMemo(() => {
        return data.map(point => ({
            epoch: point.epoch,
            loss: typeof point.loss === 'number' ? parseFloat(point.loss.toFixed(4)) : null,
            accuracy: point.accuracy ? parseFloat(point.accuracy.toFixed(4)) : null,
            validationLoss: point.validationLoss ? parseFloat(point.validationLoss.toFixed(4)) : null,
            ...point.metrics
        }));
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <div className="text-gray-500">Loading chart data...</div>
            </div>
        );
    }

    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <div className="text-gray-500">No data available</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>

            {showAccuracy && showLoss ? (
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="epoch"
                            label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }}
                        />
                        <YAxis yAxisId="left" label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: 'Accuracy', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {showLoss && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="loss"
                                stroke="#ef4444"
                                dot={false}
                                isAnimationActive={false}
                                name="Loss"
                            />
                        )}
                        {showValidation && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="validationLoss"
                                stroke="#f97316"
                                dot={false}
                                isAnimationActive={false}
                                name="Validation Loss"
                            />
                        )}
                        {showAccuracy && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#22c55e"
                                dot={false}
                                isAnimationActive={false}
                                name="Accuracy"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            ) : showLoss ? (
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="epoch"
                            label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }}
                        />
                        <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="loss"
                            stroke="#ef4444"
                            fill="url(#colorLoss)"
                            isAnimationActive={false}
                            name="Loss"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="epoch"
                            label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }}
                        />
                        <YAxis label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#22c55e"
                            dot={false}
                            isAnimationActive={false}
                            name="Accuracy"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default TrainingChart;
