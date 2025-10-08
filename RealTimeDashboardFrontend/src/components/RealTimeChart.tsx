import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataPoint {
    timestamp: number;
    value: number;
    sensorId: string;
    sensorType?: string;
}

interface RealTimeChartProps {
    data: ChartDataPoint[];
    title: string;
    height?: number;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const RealTimeChart: React.FC<RealTimeChartProps> = ({
    data,
    title,
    height = 300
}) => {
    const chartData = useMemo(() => {
        if (data.length === 0) return [];

        // Simple approach: use raw data points with time formatting
        return data
            .slice(-50) // Keep last 50 data points for performance
            .map(point => ({
                time: new Date(point.timestamp).toLocaleTimeString(),
                timestamp: point.timestamp,
                [point.sensorId]: point.value,
                sensorId: point.sensorId,
                value: point.value
            }));
    }, [data]);

    const sensorIds = useMemo(() => {
        const ids = new Set<string>();
        data.forEach(point => ids.add(point.sensorId));
        return Array.from(ids).slice(0, 6); // Limit to 6 sensors for readability
    }, [data]);

    const formatTooltip = (value: any, name: string) => {
        if (typeof value === 'number') {
            return [value.toFixed(2), name];
        }
        return [value, name];
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p>No sensor data available</p>
                        <p className="text-sm">Waiting for real-time data...</p>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            stroke="#666"
                            fontSize={12}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={12}
                            tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                            formatter={formatTooltip}
                            labelStyle={{ color: '#333' }}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <Legend />
                        {sensorIds.map((sensorId, index) => (
                            <Line
                                key={sensorId}
                                type="monotone"
                                dataKey={sensorId}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                name={sensorId}
                                connectNulls={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};