// Core data types for the analytics dashboard
export interface SensorReading {
    sensorId: string;
    value: number;
    timestamp: string;
    sensorType: string;
}

export interface AggregatedStats {
    average: number;
    min: number;
    max: number;
    count: number;
    standardDeviation: number;
    windowStart: string;
    windowEnd: string;
}

export interface Alert {
    sensorId: string;
    value: number;
    threshold: number;
    alertType: 'HIGH_VALUE' | 'LOW_VALUE';
    timestamp: string;
}

export interface PerformanceMetrics {
    totalReadings: number;
    memoryUsageMB: number;
    performance: {
        dataRetrievalMs: number;
        aggregationMs: number;
        alertRetrievalMs: number;
    };
    stats: AggregatedStats;
    recentAlertsCount: number;
    timestamp: string;
}

export interface SystemHealth {
    totalReadings: number;
    readingsPerMinute: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    timestamp: string;
}