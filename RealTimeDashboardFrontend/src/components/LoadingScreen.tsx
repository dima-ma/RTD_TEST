import React from 'react';
import { Activity, Wifi, Database, BarChart3 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
    progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = "Initializing dashboard...",
    progress = 0
}) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                {/* Animated Logo/Icon */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto relative">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-spin"></div>

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>

                    {/* Floating icons */}
                    <div className="absolute -top-4 -left-4 animate-bounce">
                        <Wifi className="w-6 h-6 text-blue-500 opacity-60" />
                    </div>
                    <div className="absolute -top-4 -right-4 animate-bounce">
                        <Database className="w-6 h-6 text-green-500 opacity-60" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 animate-bounce">
                        <BarChart3 className="w-6 h-6 text-purple-500 opacity-60" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Real-Time Analytics
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Connecting to sensor network...
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>

                {/* Loading message */}
                <p className="text-sm text-gray-500 animate-pulse">
                    {message}
                </p>

                {/* Loading steps */}
                <div className="mt-8 space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">Establishing SignalR connection</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">Loading initial sensor data</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">Initializing real-time charts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};