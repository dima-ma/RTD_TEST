import type { SensorReading, AggregatedStats, Alert, PerformanceMetrics, SystemHealth } from '../types';
import config from '../config';

export class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = config.api.baseUrl) {
        this.baseUrl = baseUrl;
    }

    private async fetchWithErrorHandling<T>(url: string): Promise<T> {
        const fullUrl = `${this.baseUrl}${url}`;
        try {
            console.log(`Making API request to: ${fullUrl}`);
            const response = await fetch(fullUrl);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error Response:`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error for ${fullUrl}:`, error);
            throw error;
        }
    }

    async getRecentReadings(count: number = 1000): Promise<SensorReading[]> {
        return this.fetchWithErrorHandling<SensorReading[]>(`/api/SensorData/recent?count=${count}`);
    }

    async getAggregatedStats(windowMinutes: number = 5): Promise<AggregatedStats> {
        return this.fetchWithErrorHandling<AggregatedStats>(`/api/SensorData/stats?windowMinutes=${windowMinutes}`);
    }

    async getRecentAlerts(count: number = 100): Promise<Alert[]> {
        return this.fetchWithErrorHandling<Alert[]>(`/api/SensorData/alerts?count=${count}`);
    }

    async getSystemHealth(): Promise<SystemHealth> {
        return this.fetchWithErrorHandling<SystemHealth>('/api/SensorData/health');
    }

    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        return this.fetchWithErrorHandling<PerformanceMetrics>('/api/Performance/metrics');
    }

    async runLoadTest(duration: number = 10): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/Performance/load-test?duration=${duration}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error(`Load test failed: ${response.statusText}`);
        }
        return await response.json();
    }

    async startSimulation(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/SensorData/simulate`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error(`Simulation start failed: ${response.statusText}`);
        }
        return await response.json();
    }
}