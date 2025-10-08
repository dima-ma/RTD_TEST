import React from 'react';
import { Wifi, WifiOff, Server, Activity, Database } from 'lucide-react';

interface SystemStatusProps {
    connectionState: string;
    readingsPerSecond: number;
    totalReadings: number;
    memoryUsage: number;
    isHealthy?: boolean;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
    connectionState,
    readingsPerSecond,
    totalReadings,
    memoryUsage,
    isHealthy = true
}) => {
    const getConnectionIcon = () => {
        return connectionState === 'Connected' ? (
            <Wifi className="text-green-500" size={20} />
        ) : (
            <WifiOff className="text-red-500" size={20} />
        );
    };

    const getConnectionColor = () => {
        switch (connectionState) {
            case 'Connected':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'Connecting':
            case 'Reconnecting':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-red-600 bg-red-50 border-red-200';
        }
    };

    const getPerformanceColor = () => {
        if (readingsPerSecond >= 800) return 'text-green-600';
        if (readingsPerSecond >= 500) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getMemoryColor = () => {
        if (memoryUsage < 200) return 'text-green-600';
        if (memoryUsage < 400) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>

            <div className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {getConnectionIcon()}
                        <span className="font-medium text-gray-700">Connection</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConnectionColor()}`}>
                        {connectionState}
                    </span>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Activity className={getPerformanceColor()} size={20} />
                        </div>
                        <p className="text-sm text-gray-600">Readings/sec</p>
                        <p className={`text-lg font-bold ${getPerformanceColor()}`}>
                            {readingsPerSecond.toLocaleString()}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Database className="text-blue-500" size={20} />
                        </div>
                        <p className="text-sm text-gray-600">Total Readings</p>
                        <p className="text-lg font-bold text-blue-600">
                            {totalReadings.toLocaleString()}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Server className={getMemoryColor()} size={20} />
                        </div>
                        <p className="text-sm text-gray-600">Memory (MB)</p>
                        <p className={`text-lg font-bold ${getMemoryColor()}`}>
                            {memoryUsage.toFixed(1)}
                        </p>
                    </div>
                </div>

                {/* Health Indicator */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                            {isHealthy ? 'System Healthy' : 'System Issues Detected'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};