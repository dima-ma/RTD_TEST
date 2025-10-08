// Configuration for the analytics dashboard
export const config = {
    // Backend API configuration
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7284',
        signalRHub: '/dashboardHub',
        timeout: 10000, // 10 seconds
    },

    // Performance settings
    performance: {
        maxReadingsInMemory: 100000,
        maxAlertsInMemory: 10000,
        chartDataPoints: 200,
        updateInterval: 1000, // 1 second
        metricsInterval: 5000, // 5 seconds
    },

    // UI settings
    ui: {
        maxAlertsDisplayed: 10,
        chartHeight: 300,
        refreshRate: 1000,
    },

    // Alert thresholds (for display purposes)
    alerts: {
        highMemoryUsage: 400, // MB
        lowThroughput: 500, // readings per second
        criticalThroughput: 100,
    }
};

// Environment-specific overrides
if (import.meta.env.DEV) {
    // Development settings
    config.api.baseUrl = 'https://localhost:7284';
}

export default config;