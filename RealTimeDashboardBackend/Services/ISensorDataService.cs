using RealTimeDashboardBackend.Models;

namespace RealTimeDashboardBackend.Services
{
    public interface ISensorDataService
    {
        void AddReading(SensorReading reading);
        IEnumerable<SensorReading> GetRecentReadings(int count = 1000);
        AggregatedStats GetAggregatedStats(TimeSpan window);
        IEnumerable<AnomalyAlert> GetRecentAlerts(int count = 100);
        int GetTotalReadingsCount();
        void PurgeOldData();
    }
}