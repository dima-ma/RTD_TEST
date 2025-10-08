import React from 'react';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import type { Alert } from '../types';

interface AlertPanelProps {
    alerts: Alert[];
    maxAlerts?: number;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, maxAlerts = 10 }) => {
    const recentAlerts = alerts.slice(-maxAlerts).reverse();

    const getAlertIcon = (alertType: string) => {
        switch (alertType) {
            case 'HIGH_VALUE':
                return <AlertTriangle className="text-red-500" size={20} />;
            case 'LOW_VALUE':
                return <AlertCircle className="text-yellow-500" size={20} />;
            default:
                return <AlertCircle className="text-gray-500" size={20} />;
        }
    };

    const getAlertColor = (alertType: string) => {
        switch (alertType) {
            case 'HIGH_VALUE':
                return 'border-l-red-500 bg-red-50';
            case 'LOW_VALUE':
                return 'border-l-yellow-500 bg-yellow-50';
            default:
                return 'border-l-gray-500 bg-gray-50';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Alerts</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-1" />
                    <span>Live</span>
                </div>
            </div>

            {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No recent alerts</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentAlerts.map((alert, index) => (
                        <div
                            key={`${alert.sensorId}-${alert.timestamp}-${index}`}
                            className={`border-l-4 p-3 rounded-r-md ${getAlertColor(alert.alertType)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    {getAlertIcon(alert.alertType)}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {alert.sensorId}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Value: {alert.value.toFixed(2)} (Threshold: {alert.threshold.toFixed(2)})
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {alert.alertType.replace('_', ' ')} • {formatTimestamp(alert.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {alerts.length > maxAlerts && (
                <div className="mt-3 text-center">
                    <p className="text-sm text-gray-500">
                        Showing {maxAlerts} of {alerts.length} alerts
                    </p>
                </div>
            )}
        </div>
    );
};