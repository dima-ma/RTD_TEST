namespace RealTimeDashboardBackend.Models
{
    public class SensorReading
    {
        public string SensorId { get; set; } = string.Empty;
        public double Value { get; set; }
        public DateTime Timestamp { get; set; }
        public string SensorType { get; set; } = string.Empty;
    }

    public class AggregatedStats
    {
        public double Average { get; set; }
        public double Min { get; set; }
        public double Max { get; set; }
        public int Count { get; set; }
        public double StandardDeviation { get; set; }
        public DateTime WindowStart { get; set; }
        public DateTime WindowEnd { get; set; }
    }

    public class AnomalyAlert
    {
        public string SensorId { get; set; } = string.Empty;
        public double Value { get; set; }
        public double Threshold { get; set; }
        public string AlertType { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}