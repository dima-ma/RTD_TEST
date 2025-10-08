import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: 'trending-up' | 'trending-down' | 'activity' | 'bar-chart';
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const iconMap = {
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'activity': Activity,
    'bar-chart': BarChart3,
};

const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon = 'activity',
    color = 'blue'
}) => {
    const IconComponent = iconMap[icon];
    const colorClasses = colorMap[color];

    const formatValue = (val: string | number): string => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            }
            if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString();
        }
        return val;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg border ${colorClasses}`}>
                    <IconComponent size={24} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center">
                    {trend === 'up' && (
                        <div className="flex items-center text-green-600">
                            <TrendingUp size={16} className="mr-1" />
                            <span className="text-sm font-medium">Trending up</span>
                        </div>
                    )}
                    {trend === 'down' && (
                        <div className="flex items-center text-red-600">
                            <TrendingDown size={16} className="mr-1" />
                            <span className="text-sm font-medium">Trending down</span>
                        </div>
                    )}
                    {trend === 'neutral' && (
                        <div className="flex items-center text-gray-600">
                            <Activity size={16} className="mr-1" />
                            <span className="text-sm font-medium">Stable</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};