import { useState, useCallback, useRef } from 'react';
import type { SensorReading, AggregatedStats, Alert } from '../types';

// Circular buffer for efficient memory management
class CircularBuffer<T> {
    private buffer: T[];
    private head = 0;
    private tail = 0;
    private size = 0;

    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.buffer = new Array(capacity);
    }

    push(item: T): void {
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.capacity;

        if (this.size < this.capacity) {
            this.size++;
        } else {
            this.head = (this.head + 1) % this.capacity;
        }
    }

    getAll(): T[] {
        if (this.size === 0) return [];

        const result: T[] = [];
        for (let i = 0; i < this.size; i++) {
            const index = (this.head + i) % this.capacity;
            result.push(this.buffer[index]);
        }
        return result;
    }

    getRecent(count: number): T[] {
        const all = this.getAll();
        return all.slice(-count);
    }

    clear(): void {
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    get length(): number {
        return this.size;
    }
}

export const useDataStore = () => {
    // Use circular buffers for efficient memory management
    const readingsBuffer = useRef(new CircularBuffer<SensorReading>(100000));
    const alertsBuffer = useRef(new CircularBuffer<Alert>(10000));

    const [stats, setStats] = useState<AggregatedStats | null>(null);
    const [recentReadings, setRecentReadings] = useState<SensorReading[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
    const [readingsPerSecond, setReadingsPerSecond] = useState(0);

    // Performance tracking
    const lastSecondCount = useRef(0);
    const lastSecondTimestamp = useRef(Date.now());

    const addReading = useCallback((reading: SensorReading) => {
        readingsBuffer.current.push(reading);

        // Update readings per second calculation
        const now = Date.now();
        if (now - lastSecondTimestamp.current >= 1000) {
            setReadingsPerSecond(lastSecondCount.current);
            lastSecondCount.current = 0;
            lastSecondTimestamp.current = now;
        }
        lastSecondCount.current++;

        // Update recent readings for display (last 1000)
        setRecentReadings(readingsBuffer.current.getRecent(1000));
    }, []);

    const updateStats = useCallback((newStats: AggregatedStats) => {
        setStats(newStats);
    }, []);

    const addAlerts = useCallback((alerts: Alert[]) => {
        alerts.forEach(alert => alertsBuffer.current.push(alert));
        setRecentAlerts(alertsBuffer.current.getRecent(100));
    }, []);

    const getChartData = useCallback((sensorType?: string, limit: number = 100) => {
        const readings = readingsBuffer.current.getRecent(limit);

        if (sensorType) {
            return readings
                .filter(r => r.sensorType === sensorType)
                .map(r => ({
                    timestamp: new Date(r.timestamp).getTime(),
                    value: r.value,
                    sensorId: r.sensorId
                }));
        }

        return readings.map(r => ({
            timestamp: new Date(r.timestamp).getTime(),
            value: r.value,
            sensorId: r.sensorId,
            sensorType: r.sensorType
        }));
    }, []);

    const getSensorTypes = useCallback(() => {
        const readings = readingsBuffer.current.getAll();
        return [...new Set(readings.map(r => r.sensorType))];
    }, []);

    const getMemoryUsage = useCallback(() => {
        return {
            totalReadings: readingsBuffer.current.length,
            totalAlerts: alertsBuffer.current.length,
            estimatedMemoryMB: Math.round(
                (readingsBuffer.current.length * 100 + alertsBuffer.current.length * 80) / 1024 / 1024 * 100
            ) / 100
        };
    }, []);

    return {
        // Data
        stats,
        recentReadings,
        recentAlerts,
        readingsPerSecond,

        // Actions
        addReading,
        updateStats,
        addAlerts,

        // Computed
        getChartData,
        getSensorTypes,
        getMemoryUsage
    };
};