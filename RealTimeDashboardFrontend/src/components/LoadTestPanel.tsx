import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { ApiService } from '../services/apiService';

interface LoadTestPanelProps {
    apiService: ApiService;
}

export const LoadTestPanel: React.FC<LoadTestPanelProps> = ({ apiService }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [duration, setDuration] = useState(10);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runLoadTest = async () => {
        setIsRunning(true);
        setError(null);
        setResults(null);

        try {
            const result = await apiService.runLoadTest(duration);
            setResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Load test failed');
        } finally {
            setIsRunning(false);
        }
    };

    const startSimulation = async () => {
        setIsSimulating(true);
        setError(null);

        try {
            await apiService.startSimulation();
            // Simulation started successfully
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation start failed');
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Testing</h3>

            <div className="space-y-4">
                {/* Simulation Control */}
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="font-medium text-green-800">Data Simulation</h5>
                            <p className="text-sm text-green-700">Start continuous sensor data generation</p>
                        </div>
                        <button
                            onClick={startSimulation}
                            disabled={isSimulating}
                            className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${isSimulating
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {isSimulating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Starting...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={16} />
                                    <span>Start Simulation</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Test Configuration */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (seconds)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isRunning}
                        />
                    </div>

                    <button
                        onClick={runLoadTest}
                        disabled={isRunning}
                        className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${isRunning
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Running...</span>
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                <span>Start Test</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Results Display */}
                {results && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <h4 className="font-medium text-gray-800 mb-3">Test Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-2 font-medium">{results.testDurationSeconds?.toFixed(1)}s</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Readings Added:</span>
                                <span className="ml-2 font-medium">{results.readingsAdded?.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Readings/sec:</span>
                                <span className="ml-2 font-medium">{results.readingsPerSecond?.toFixed(0)}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Total in System:</span>
                                <span className="ml-2 font-medium">{results.totalReadingsInSystem?.toLocaleString()}</span>
                            </div>
                        </div>

                        {results.testCompleted && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                                <span className="text-gray-600 text-xs">
                                    Completed: {new Date(results.testCompleted).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Performance Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h5 className="font-medium text-blue-800 mb-2">Performance Targets</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Target: 1,000 readings/second</li>
                        <li>• Memory: Handle 100,000 data points</li>
                        <li>• Retention: 24-hour auto-purge</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};