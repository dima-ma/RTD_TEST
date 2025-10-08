using RealTimeDashboardBackend.Models;
using System.Collections.Concurrent;

namespace RealTimeDashboardBackend.Services
{
    public class SensorDataService : ISensorDataService
    {
        private readonly ConcurrentQueue<SensorReading> _readings = new();
        private readonly ConcurrentQueue<AnomalyAlert> _alerts = new();
        private readonly object _lockObject = new();
        private const int MaxReadings = 100_000;
        private const int MaxAlerts = 1000;
        private readonly TimeSpan DataRetentionPeriod = TimeSpan.FromHours(24);

        public void AddReading(SensorReading reading)
        {
            _readings.Enqueue(reading);
            
            // Maintain size limit
            while (_readings.Count > MaxReadings)
            {
                _readings.TryDequeue(out _);
            }

            // Check for anomalies
            CheckForAnomalies(reading);
        }

        public IEnumerable<SensorReading> GetRecentReadings(int count = 1000)
        {
            return _readings.TakeLast(Math.Min(count, _readings.Count));
        }

        public AggregatedStats GetAggregatedStats(TimeSpan window)
        {
            var cutoff = DateTime.UtcNow - window;
            var windowReadings = _readings
                .Where(r => r.Timestamp >= cutoff)
                .Select(r => r.Value)
                .ToList();

            if (!windowReadings.Any())
            {
                return new AggregatedStats
                {
                    WindowStart = cutoff,
                    WindowEnd = DateTime.UtcNow
                };
            }

            var avg = windowReadings.Average();
            var variance = windowReadings.Sum(v => Math.Pow(v - avg, 2)) / windowReadings.Count;
            var stdDev = Math.Sqrt(variance);

            return new AggregatedStats
            {
                Average = avg,
                Min = windowReadings.Min(),
                Max = windowReadings.Max(),
                Count = windowReadings.Count,
                StandardDeviation = stdDev,
                WindowStart = cutoff,
                WindowEnd = DateTime.UtcNow
            };
        }

        public IEnumerable<AnomalyAlert> GetRecentAlerts(int count = 100)
        {
            return _alerts.TakeLast(Math.Min(count, _alerts.Count));
        }

        public int GetTotalReadingsCount()
        {
            return _readings.Count;
        }

        public void PurgeOldData()
        {
            var cutoff = DateTime.UtcNow - DataRetentionPeriod;
            
            // Create new queues with only recent data
            var recentReadings = _readings.Where(r => r.Timestamp >= cutoff).ToList();
            var recentAlerts = _alerts.Where(a => a.Timestamp >= cutoff).ToList();

            lock (_lockObject)
            {
                // Clear and repopulate
                while (_readings.TryDequeue(out _)) { }
                while (_alerts.TryDequeue(out _)) { }

                foreach (var reading in recentReadings)
                    _readings.Enqueue(reading);

                foreach (var alert in recentAlerts)
                    _alerts.Enqueue(alert);
            }
        }

        private void CheckForAnomalies(SensorReading reading)
        {
            // Simple anomaly detection using statistical thresholds
            var recentStats = GetAggregatedStats(TimeSpan.FromMinutes(5));
            
            if (recentStats.Count < 10) return; // Need enough data for meaningful stats

            var threshold = recentStats.Average + (2 * recentStats.StandardDeviation);
            var lowerThreshold = recentStats.Average - (2 * recentStats.StandardDeviation);

            if (reading.Value > threshold)
            {
                var alert = new AnomalyAlert
                {
                    SensorId = reading.SensorId,
                    Value = reading.Value,
                    Threshold = threshold,
                    AlertType = "HIGH_VALUE",
                    Timestamp = reading.Timestamp
                };
                
                _alerts.Enqueue(alert);
                
                // Maintain alert limit
                while (_alerts.Count > MaxAlerts)
                {
                    _alerts.TryDequeue(out _);
                }
            }
            else if (reading.Value < lowerThreshold)
            {
                var alert = new AnomalyAlert
                {
                    SensorId = reading.SensorId,
                    Value = reading.Value,
                    Threshold = lowerThreshold,
                    AlertType = "LOW_VALUE",
                    Timestamp = reading.Timestamp
                };
                
                _alerts.Enqueue(alert);
                
                while (_alerts.Count > MaxAlerts)
                {
                    _alerts.TryDequeue(out _);
                }
            }
        }
    }
}