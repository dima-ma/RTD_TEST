import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { SensorReading, AggregatedStats, Alert } from '../types';
import config from '../config';

export class SignalRService {
    private connection: HubConnection | null = null;
    private reconnectAttempts = 0;
    private baseUrl: string;
    private connectionStateCallback?: (state: string) => void;

    constructor(baseUrl: string = config.api.baseUrl) {
        this.baseUrl = baseUrl;
    }

    async connect(): Promise<void> {
        if (this.connection?.state === 'Connected') return;

        this.connection = new HubConnectionBuilder()
            .withUrl(`${this.baseUrl}/dashboardHub`)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: () => {
                    this.reconnectAttempts++;
                    return Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                }
            })
            .configureLogging(LogLevel.Information)
            .build();

        this.setupEventHandlers();

        try {
            await this.connection.start();
            console.log('SignalR Connected');
            this.reconnectAttempts = 0;
            this.connectionStateCallback?.('Connected');
        } catch (error) {
            console.error('SignalR Connection Error:', error);
            this.connectionStateCallback?.('Failed');
            throw error;
        }
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        this.connection.onreconnecting(() => {
            console.log('SignalR Reconnecting...');
            this.connectionStateCallback?.('Reconnecting');
        });

        this.connection.onreconnected(() => {
            console.log('SignalR Reconnected');
            this.reconnectAttempts = 0;
            this.connectionStateCallback?.('Connected');
        });

        this.connection.onclose(() => {
            console.log('SignalR Disconnected');
            this.connectionStateCallback?.('Disconnected');
        });
    }

    onReceiveReading(callback: (reading: SensorReading) => void): void {
        this.connection?.on('ReceiveReading', callback);
    }

    onReceiveStats(callback: (stats: AggregatedStats) => void): void {
        this.connection?.on('ReceiveStats', callback);
    }

    onReceiveAlerts(callback: (alerts: Alert[]) => void): void {
        this.connection?.on('ReceiveAlerts', callback);
    }

    onConnectionStateChanged(callback: (state: string) => void): void {
        this.connectionStateCallback = callback;
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    get connectionState(): string {
        return this.connection?.state || 'Disconnected';
    }
}