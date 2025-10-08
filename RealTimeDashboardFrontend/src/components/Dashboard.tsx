import React, { useEffect, useState } from 'react';
import { SignalRService } from '../services/signalRService';
import { ApiService } from '../services/apiService';
import { useDataStore } from '../hooks/useDataStore';
import { RealTimeChart } from './RealTimeChart';
import { StatsCard } from './StatsCard';
import { AlertPanel } from './AlertPanel';
import { SystemStatus } from './SystemStatus';
import { LoadTestPanel } from './LoadTestPanel';
import { LoadingScreen } from './LoadingScreen';
import type { PerformanceMetrics } from '../types';

export const Dashboard: React.FC = () => {
    const [signalRService] = useState(() => new SignalRService());
    const [apiService] = useState(() => new ApiService());
    const [connectionState, setConnectionState] = useState('Disconnected');
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Initializing dashboard...');
    const [loadingProgress, setLoadingProgress] = useState(0);

    const {
        stats,
        recentAlerts,
        readingsPerSecond,
        addReading,
        updateStats,
        addAlerts,
        getChartData,
        getSensorTypes,
        getMemoryUsage
    } = useDataStore();

    // Initialize connection and load initial data
    useEffect(() => {
        const initialize = async () => {
            try {
                setLoadingMessage('Establishing SignalR connection...');
                setLoadingProgress(20);

                // Connect to SignalR
                await signalRService.connect();
                setConnectionState(signalRService.connectionState);
                setLoadingProgress(40);

                setLoadingMessage('Setting up real-time event listeners...');
                // Set up real-time event listeners
                signalRService.onReceiveReading(addReading);
                signalRService.onReceiveStats(updateStats);
                signalRService.onReceiveAlerts(addAlerts);
                signalRService.onConnectionStateChanged(setConnectionState);
                setLoadingProgress(60);

                setLoadingMessage('Loading initial sensor data...');
                // Load initial data
                try {
                    const [initialReadings, initialStats, initialAlerts] = await Promise.all([
                        apiService.getRecentReadings(1000),
                        apiService.getAggregatedStats(5),
                        apiService.getRecentAlerts(100)
                    ]);



                    setLoadingProgress(80);

                    setLoadingMessage('Initializing dashboard components...');
                    // Populate initial data
                    initialReadings.forEach(addReading);
                    updateStats(initialStats);
                    if (initialAlerts.length > 0) {
                        addAlerts(initialAlerts);
                    }
                    setLoadingProgress(100);
                } catch (apiError) {
                    console.warn('Failed to load initial data from API, continuing with real-time only:', apiError);
                    setLoadingProgress(100);
                }

                // Small delay to show completion
                setTimeout(() => {
                    setIsInitialized(true);
                }, 500);
            } catch (error) {
                console.error('Failed to initialize dashboard:', error);
                setConnectionState('Failed');
                setLoadingMessage('Connection failed. Dashboard will continue with real-time only.');
                // Still initialize the dashboard even if initial connection fails
                setTimeout(() => {
                    setIsInitialized(true);
                }, 2000);
            }
        };

        initialize();

        return () => {
            signalRService.disconnect();
        };
    }, [signalRService, apiService, addReading, updateStats, addAlerts]);



    // Fetch performance metrics periodically
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const metrics = await apiService.getPerformanceMetrics();
                setPerformanceMetrics(metrics);
            } catch (error) {
                console.error('Failed to fetch performance metrics:', error);
            }
        };

        if (isInitialized) {
            fetchMetrics();
            const interval = setInterval(fetchMetrics, 5000);
            return () => clearInterval(interval);
        }
    }, [apiService, isInitialized]);

    const sensorTypes = getSensorTypes();
    const memoryUsage = getMemoryUsage();



    if (!isInitialized) {
        return (
            <LoadingScreen
                message={loadingMessage}
                progress={loadingProgress}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header Bar */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Real-Time Analytics Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Monitoring {memoryUsage.totalReadings.toLocaleString()} sensor readings across {sensorTypes.length} sensor types
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${connectionState === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-sm font-medium text-gray-700">{connectionState}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatsCard
                            title="Readings/Second"
                            value={readingsPerSecond}
                            subtitle="Current throughput"
                            icon="activity"
                            color="blue"
                            trend={readingsPerSecond > 800 ? 'up' : readingsPerSecond > 500 ? 'neutral' : 'down'}
                        />
                        <StatsCard
                            title="Total Readings"
                            value={memoryUsage.totalReadings}
                            subtitle="In memory"
                            icon="bar-chart"
                            color="green"
                        />
                        <StatsCard
                            title="Active Alerts"
                            value={recentAlerts.length}
                            subtitle="Anomalies detected"
                            icon="trending-up"
                            color={recentAlerts.length > 10 ? 'red' : recentAlerts.length > 5 ? 'yellow' : 'green'}
                        />
                        <StatsCard
                            title="Memory Usage"
                            value={`${memoryUsage.estimatedMemoryMB} MB`}
                            subtitle="Estimated usage"
                            icon="bar-chart"
                            color={memoryUsage.estimatedMemoryMB > 400 ? 'red' : memoryUsage.estimatedMemoryMB > 200 ? 'yellow' : 'green'}
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Charts Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* All Sensors Chart */}
                            <RealTimeChart
                                data={getChartData(undefined, 200)}
                                title="All Sensors - Real-Time Data"
                                height={350}
                            />

                            {/* Individual Sensor Type Charts */}
                            {sensorTypes.slice(0, 2).map(sensorType => (
                                <RealTimeChart
                                    key={sensorType}
                                    data={getChartData(sensorType, 100)}
                                    title={`${sensorType} Sensors`}
                                    height={250}
                                />
                            ))}
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-6">
                            <SystemStatus
                                connectionState={connectionState}
                                readingsPerSecond={readingsPerSecond}
                                totalReadings={memoryUsage.totalReadings}
                                memoryUsage={memoryUsage.estimatedMemoryMB}
                                isHealthy={connectionState === 'Connected' && readingsPerSecond > 0}
                            />



                            <AlertPanel alerts={recentAlerts} maxAlerts={8} />
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Aggregated Statistics */}
                        {stats && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Aggregated Statistics
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Average</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {stats.average.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Count</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {stats.count.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Max</p>
                                        <p className="text-xl font-bold text-red-600">
                                            {stats.max.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Std Dev</p>
                                        <p className="text-xl font-bold text-yellow-600">
                                            {stats.standardDeviation.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-gray-500 text-center">
                                    Window: {new Date(stats.windowStart).toLocaleTimeString()} - {new Date(stats.windowEnd).toLocaleTimeString()}
                                </div>
                            </div>
                        )}

                        {/* Load Testing Panel */}
                        <LoadTestPanel apiService={apiService} />
                    </div>

                    {/* Performance Metrics */}
                    {performanceMetrics && (
                        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Performance Metrics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Data Retrieval</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {performanceMetrics.performance.dataRetrievalMs}ms
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Aggregation</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {performanceMetrics.performance.aggregationMs}ms
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Alert Retrieval</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {performanceMetrics.performance.alertRetrievalMs}ms
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};